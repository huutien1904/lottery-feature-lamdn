import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import type { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import type { TenantContext } from '../interfaces/tenant-context.interface';

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      headers: Record<string, string | string[] | undefined>;
      tenant?: TenantContext;
    }>();

    const userId = req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Missing authenticated user.');
    }

    const rawTenantId = req.headers['x-tenant-id'];
    const tenantId = this.readHeaderValue(rawTenantId);

    let membership: {
      tenantId: string;
      role: TenantContext['role'];
    } | null = null;

    if (tenantId) {
      membership = await this.prisma.tenantMembership.findFirst({
        where: { userId, tenantId },
        select: { tenantId: true, role: true },
      });
      if (!membership) {
        throw new ForbiddenException('You do not belong to this tenant.');
      }
    } else {
      membership = await this.prisma.tenantMembership.findFirst({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        select: { tenantId: true, role: true },
      });
    }

    if (!membership) {
      throw new ForbiddenException(
        'No tenant membership found for current user.',
      );
    }

    req.tenant = {
      tenantId: membership.tenantId,
      role: membership.role,
    };
    return true;
  }

  private readHeaderValue(
    value: string | string[] | undefined,
  ): string | undefined {
    if (Array.isArray(value)) {
      throw new BadRequestException('x-tenant-id must be a single value.');
    }
    return value?.trim() || undefined;
  }
}
