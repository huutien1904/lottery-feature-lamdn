import { Module } from '@nestjs/common';

import { TenantsController } from './tenants.controller';
import { TenantAccessGuard } from './guards/tenant-access.guard';
import { TenantsService } from './tenants.service';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, TenantAccessGuard],
  exports: [TenantAccessGuard, TenantsService],
})
export class TenantsModule {}
