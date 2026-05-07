import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listTenants(query: AdminListQueryDto) {
    const { skip, take } = this.normalizePage(query);
    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          subscriptions: {
            orderBy: [{ createdAt: 'desc' }],
            take: 1,
            include: { plan: true },
          },
        },
      }),
      this.prisma.tenant.count(),
    ]);
    return { items, total, offset: skip, limit: take };
  }

  async updateTenantStatus(tenantId: string, dto: UpdateTenantStatusDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: { status: dto.status },
    });
  }

  async listUsers(query: AdminListQueryDto) {
    const { skip, take } = this.normalizePage(query);
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          memberships: {
            select: {
              role: true,
              isDefault: true,
              tenant: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { items, total, offset: skip, limit: take };
  }

  async listSubscriptions(query: AdminListQueryDto) {
    const { skip, take } = this.normalizePage(query);
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, name: true, slug: true } },
          plan: true,
        },
      }),
      this.prisma.subscription.count(),
    ]);
    return { items, total, offset: skip, limit: take };
  }

  async listPayments(query: AdminListQueryDto) {
    const { skip, take } = this.normalizePage(query);
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, name: true, slug: true } },
          subscription: {
            select: { id: true, status: true },
          },
        },
      }),
      this.prisma.payment.count(),
    ]);
    return { items, total, offset: skip, limit: take };
  }

  async listAuditLogs(query: AdminListQueryDto) {
    const { skip, take } = this.normalizePage(query);
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, name: true, slug: true } },
          actor: { select: { id: true, email: true, fullName: true } },
        },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { items, total, offset: skip, limit: take };
  }

  private normalizePage(query: AdminListQueryDto) {
    return {
      skip: query.offset ?? 0,
      take: Math.min(query.limit ?? 20, 100),
    };
  }
}
