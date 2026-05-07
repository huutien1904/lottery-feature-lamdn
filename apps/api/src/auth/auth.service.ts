import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  PlatformRole,
  Prisma,
  SubscriptionStatus,
  TenantRole,
} from '@prisma/client';
import * as argon2 from 'argon2';
import type { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });
    if (exists) {
      throw new BadRequestException('Email already exists.');
    }

    const passwordHash = await argon2.hash(dto.password);
    const tenantSlug = this.makeTenantSlug(dto.tenantName);
    const now = new Date();
    const trialEndAt = new Date(now);
    trialEndAt.setDate(trialEndAt.getDate() + 14);

    const result = await this.prisma.$transaction(async (tx) => {
      const trialPlan = await tx.plan.findUnique({
        where: { code: 'trial' },
        select: { id: true },
      });

      if (!trialPlan) {
        throw new BadRequestException('Trial plan is not configured.');
      }

      const tenant = await tx.tenant.create({
        data: {
          name: dto.tenantName,
          slug: await this.uniqueSlug(tx, tenantSlug),
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          fullName: dto.fullName,
          passwordHash,
        },
      });

      await tx.tenantMembership.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          role: TenantRole.OWNER,
          isDefault: true,
        },
      });

      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: trialPlan.id,
          status: SubscriptionStatus.TRIALING,
          trialStartAt: now,
          trialEndAt,
          currentPeriodStart: now,
          currentPeriodEnd: trialEndAt,
        },
      });

      return { user, tenant };
    });

    return this.issueAuthResponse(
      result.user.id,
      result.user.email,
      result.user.fullName,
      result.user.platformRole,
    );
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        fullName: true,
        passwordHash: true,
        platformRole: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const validPassword = await argon2.verify(user.passwordHash, dto.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.issueAuthResponse(
      user.id,
      user.email,
      user.fullName,
      user.platformRole,
    );
  }

  async refresh(refreshToken: string) {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        platformRole: true,
        refreshTokenHash: true,
        refreshTokenExpiresAt: true,
      },
    });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired.');
    }

    const validToken = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!validToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return this.issueAuthResponse(
      user.id,
      user.email,
      user.fullName,
      user.platformRole,
    );
  }

  async logout(payload: JwtPayload) {
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: {
        refreshTokenHash: null,
        refreshTokenExpiresAt: null,
      },
    });
    return this.ok({ loggedOut: true });
  }

  async me(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        status: true,
        platformRole: true,
        memberships: {
          select: {
            role: true,
            isDefault: true,
            tenant: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return this.ok({ user });
  }

  private async issueAuthResponse(
    userId: string,
    email: string,
    fullName: string,
    platformRole: PlatformRole,
  ) {
    const payload: JwtPayload = { sub: userId, email, platformRole };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refreshSecret(),
      expiresIn: this.refreshExpiresIn(),
    });

    const refreshTokenHash = await argon2.hash(refreshToken);
    const refreshTokenExpiresAt = this.resolveRefreshExpiryDate();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshTokenHash,
        refreshTokenExpiresAt,
        lastLoginAt: new Date(),
      },
    });

    return this.ok({
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        fullName,
        platformRole,
      },
    });
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.refreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  private refreshSecret() {
    return (
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'dev-refresh-secret'
    );
  }

  private refreshExpiresIn() {
    return (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
      '30d') as StringValue;
  }

  private resolveRefreshExpiryDate() {
    const raw =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d';
    const trimmed = raw.trim();
    const match = /^(\d+)\s*([smhd])?$/.exec(trimmed);
    if (!match) {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    const amount = Number(match[1]);
    const unit = match[2] ?? 's';
    const multiplier =
      unit === 's'
        ? 1000
        : unit === 'm'
          ? 60_000
          : unit === 'h'
            ? 3_600_000
            : 86_400_000;
    return new Date(Date.now() + amount * multiplier);
  }

  private ok<T>(data: T) {
    return { success: true as const, data };
  }

  private makeTenantSlug(name: string) {
    return (
      name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'tenant'
    );
  }

  private async uniqueSlug(tx: Prisma.TransactionClient, baseSlug: string) {
    let slug = baseSlug;
    let n = 1;
    while (true) {
      const exists = await tx.tenant.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!exists) return slug;
      n += 1;
      slug = `${baseSlug}-${n}`;
    }
  }
}
