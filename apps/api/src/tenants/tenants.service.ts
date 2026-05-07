import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PlatformRole, TenantRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import type { TenantContext } from './interfaces/tenant-context.interface';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async current(user: JwtPayload, tenant: TenantContext) {
    const data = await this.prisma.tenant.findUnique({
      where: { id: tenant.tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        timezone: true,
        locale: true,
        memberships: {
          select: {
            id: true,
            role: true,
            isDefault: true,
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
                platformRole: true,
              },
            },
          },
        },
      },
    });

    if (!data) {
      throw new NotFoundException('Tenant not found.');
    }
    return {
      tenant: data,
      context: {
        userId: user.sub,
        role: tenant.role,
      },
    };
  }

  async switchTenant(user: JwtPayload, nextTenantId: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { userId: user.sub, tenantId: nextTenantId },
      select: { id: true },
    });
    if (!membership) {
      throw new ForbiddenException('You do not belong to this tenant.');
    }

    await this.prisma.$transaction([
      this.prisma.tenantMembership.updateMany({
        where: { userId: user.sub, isDefault: true },
        data: { isDefault: false },
      }),
      this.prisma.tenantMembership.update({
        where: { id: membership.id },
        data: { isDefault: true },
      }),
    ]);

    return { switched: true, tenantId: nextTenantId };
  }

  async inviteMember(
    tenant: TenantContext,
    currentUser: JwtPayload,
    dto: InviteMemberDto,
  ) {
    this.assertTenantAdmin(tenant.role, currentUser.platformRole);
    if (dto.role === TenantRole.OWNER) {
      throw new BadRequestException(
        'Use ownership transfer flow for OWNER role.',
      );
    }

    const email = dto.email.toLowerCase();
    const user =
      (await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, fullName: true },
      })) ??
      (await this.prisma.user.create({
        data: {
          email,
          fullName: dto.fullName?.trim() || email.split('@')[0] || 'Member',
          passwordHash: await argon2.hash(randomBytes(18).toString('hex')),
          platformRole: PlatformRole.USER,
        },
        select: { id: true, email: true, fullName: true },
      }));

    const membership = await this.prisma.tenantMembership.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.tenantId,
          userId: user.id,
        },
      },
      update: { role: dto.role },
      create: {
        tenantId: tenant.tenantId,
        userId: user.id,
        role: dto.role,
        isDefault: false,
      },
      select: {
        id: true,
        role: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
    });

    return { invited: true, membership };
  }

  async updateMemberRole(
    tenant: TenantContext,
    currentUser: JwtPayload,
    membershipId: string,
    dto: UpdateMemberRoleDto,
  ) {
    this.assertTenantAdmin(tenant.role, currentUser.platformRole);
    if (dto.role === TenantRole.OWNER) {
      throw new BadRequestException(
        'Use ownership transfer flow for OWNER role.',
      );
    }

    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        id: membershipId,
        tenantId: tenant.tenantId,
      },
      select: { id: true, userId: true, role: true },
    });
    if (!membership) {
      throw new NotFoundException('Membership not found.');
    }

    const updated = await this.prisma.tenantMembership.update({
      where: { id: membership.id },
      data: { role: dto.role },
      select: { id: true, role: true, userId: true },
    });
    return { updated: true, membership: updated };
  }

  async removeMember(
    tenant: TenantContext,
    currentUser: JwtPayload,
    membershipId: string,
  ) {
    this.assertTenantAdmin(tenant.role, currentUser.platformRole);
    const membership = await this.prisma.tenantMembership.findFirst({
      where: { id: membershipId, tenantId: tenant.tenantId },
      select: { id: true, role: true, userId: true },
    });
    if (!membership) {
      throw new NotFoundException('Membership not found.');
    }
    if (membership.role === TenantRole.OWNER) {
      throw new BadRequestException('Cannot remove OWNER membership.');
    }
    await this.prisma.tenantMembership.delete({ where: { id: membership.id } });
    return { removed: true };
  }

  private assertTenantAdmin(role: TenantRole, platformRole: PlatformRole) {
    if (
      platformRole === PlatformRole.SUPER_ADMIN ||
      role === TenantRole.OWNER ||
      role === TenantRole.ADMIN
    ) {
      return;
    }
    throw new ForbiddenException('Insufficient tenant role.');
  }
}
