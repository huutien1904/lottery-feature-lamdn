import {
  BadRequestException,
  ConflictException,
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
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import type { GoogleOAuthUser } from './types/google-oauth-user';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true, googleId: true, passwordHash: true },
    });
    if (existing) {
      if (existing.googleId && !existing.passwordHash) {
        throw new BadRequestException('GOOGLE_ACCOUNT_EXISTS');
      }
      throw new BadRequestException('EMAIL_ALREADY_EXISTS');
    }

    const emailUsername = dto.email.split('@')[0];
    const resolvedFullName =
      dto.fullName?.trim() && dto.fullName.trim().length >= 2
        ? dto.fullName.trim()
        : emailUsername;
    const tenantDisplayName = resolvedFullName;
    const tenantSlug = this.makeTenantSlug(tenantDisplayName);

    const passwordHash = await argon2.hash(dto.password);
    const now = new Date();
    const trialEndAt = new Date(now);
    trialEndAt.setDate(trialEndAt.getDate() + 14);

    const verificationToken = randomUUID();
    const verificationExpiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

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
          name: tenantDisplayName,
          slug: await this.uniqueSlug(tx, tenantSlug),
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          fullName: resolvedFullName,
          passwordHash,
          emailVerificationToken: verificationToken,
          emailVerificationExpiresAt: verificationExpiresAt,
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

    await this.mailService.sendVerificationEmail({
      to: result.user.email,
      fullName: result.user.fullName,
      token: verificationToken,
      locale: dto.locale ?? 'vi',
    });

    return this.ok({ message: 'verification_sent', email: result.user.email });
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: token },
      select: {
        id: true,
        emailVerifiedAt: true,
        emailVerificationExpiresAt: true,
      },
    });

    if (!user || !user.emailVerificationExpiresAt) {
      throw new BadRequestException('INVALID_TOKEN');
    }

    if (user.emailVerificationExpiresAt < new Date()) {
      throw new BadRequestException('TOKEN_EXPIRED');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });

    return this.ok({ verified: true });
  }

  async resendVerification(email: string, locale: 'vi' | 'en') {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, fullName: true, emailVerifiedAt: true },
    });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerifiedAt) {
      return this.ok({ sent: true });
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail({
      to: email.toLowerCase(),
      fullName: user.fullName,
      token,
      locale,
    });

    return this.ok({ sent: true });
  }

  /**
   * Find or create the user for a Google account, link Google to an existing email
   * when safe, and provision the same trial tenant as email/password register.
   */
  async provisionGoogleUser(params: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    emailVerifiedFromGoogle: boolean;
  }): Promise<GoogleOAuthUser> {
    const { googleId, email, fullName, avatarUrl, emailVerifiedFromGoogle } =
      params;

    const existingGoogle = await this.prisma.user.findUnique({
      where: { googleId },
      select: { id: true, email: true, fullName: true, platformRole: true },
    });
    if (existingGoogle) {
      return { ...existingGoogle, isNew: false };
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        platformRole: true,
        googleId: true,
        emailVerifiedAt: true,
        avatarUrl: true,
      },
    });

    if (existingEmail) {
      if (
        existingEmail.googleId != null &&
        existingEmail.googleId !== googleId
      ) {
        throw new ConflictException(
          'This email is already linked to a different Google account.',
        );
      }

      if (!emailVerifiedFromGoogle) {
        throw new UnauthorizedException(
          'Your Google account email must be verified before it can be linked to an existing account.',
        );
      }

      const emailVerifiedAt =
        existingEmail.emailVerifiedAt ??
        (emailVerifiedFromGoogle ? new Date() : undefined);

      const mergedName =
        existingEmail.fullName?.trim().length >= 2
          ? existingEmail.fullName
          : fullName;

      const updated = await this.prisma.user.update({
        where: { id: existingEmail.id },
        data: {
          googleId,
          emailVerifiedAt,
          // Clear any pending email verification since Google confirmed it
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
          fullName: mergedName,
          avatarUrl: existingEmail.avatarUrl ?? avatarUrl ?? undefined,
        },
        select: { id: true, email: true, fullName: true, platformRole: true },
      });
      return { ...updated, isNew: false };
    }

    const tenantSlug = this.makeTenantSlug(fullName);
    const tenantDisplayName =
      fullName.trim().length >= 2 ? fullName.trim() : email.split('@')[0];
    const now = new Date();
    const trialEndAt = new Date(now);
    trialEndAt.setDate(trialEndAt.getDate() + 14);

    const created = await this.prisma.$transaction(async (tx) => {
      const trialPlan = await tx.plan.findUnique({
        where: { code: 'trial' },
        select: { id: true },
      });

      if (!trialPlan) {
        throw new BadRequestException('Trial plan is not configured.');
      }

      const tenant = await tx.tenant.create({
        data: {
          name: tenantDisplayName,
          slug: await this.uniqueSlug(tx, tenantSlug),
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          fullName,
          googleId,
          passwordHash: null,
          avatarUrl: avatarUrl ?? undefined,
          emailVerifiedAt: emailVerifiedFromGoogle ? new Date() : null,
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

      return user;
    });

    const newUser = {
      id: created.id,
      email: created.email,
      fullName: created.fullName,
      platformRole: created.platformRole,
      isNew: true,
    };

    // Send welcome email for new Google OAuth users (fire-and-forget)
    void this.mailService.sendWelcomeEmail({
      to: created.email,
      fullName: created.fullName,
      locale: 'vi',
    });

    return newUser;
  }

  async issueGoogleOAuthTokens(user: GoogleOAuthUser) {
    const envelope = await this.issueAuthResponse(
      user.id,
      user.email,
      user.fullName,
      user.platformRole,
    );
    return envelope.data;
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
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account uses Google sign-in. Please continue with Google.',
      );
    }

    const validPassword = await argon2.verify(user.passwordHash, dto.password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('EMAIL_NOT_VERIFIED');
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
        avatarUrl: true,
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
