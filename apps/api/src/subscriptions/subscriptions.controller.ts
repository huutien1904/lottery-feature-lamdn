import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../tenants/decorators/current-tenant.decorator';
import { TenantAccessGuard } from '../tenants/guards/tenant-access.guard';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current-plan')
  currentPlan(@CurrentTenant() tenant: TenantContext) {
    return this.subscriptionsService.currentPlan(tenant.tenantId);
  }
}
