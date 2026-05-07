import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentTenant } from './decorators/current-tenant.decorator';
import { InviteMemberDto } from './dto/invite-member.dto';
import { SwitchTenantDto } from './dto/switch-tenant.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { TenantAccessGuard } from './guards/tenant-access.guard';
import type { TenantContext } from './interfaces/tenant-context.interface';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  current(
    @CurrentUser() user: JwtPayload,
    @CurrentTenant() tenant: TenantContext,
  ) {
    return this.tenantsService.current(user, tenant);
  }

  @Post('switch')
  switchTenant(@CurrentUser() user: JwtPayload, @Body() dto: SwitchTenantDto) {
    return this.tenantsService.switchTenant(user, dto.tenantId);
  }

  @Post('members/invite')
  inviteMember(
    @CurrentUser() user: JwtPayload,
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: InviteMemberDto,
  ) {
    return this.tenantsService.inviteMember(tenant, user, dto);
  }

  @Patch('members/:membershipId/role')
  updateMemberRole(
    @CurrentUser() user: JwtPayload,
    @CurrentTenant() tenant: TenantContext,
    @Param('membershipId') membershipId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.tenantsService.updateMemberRole(
      tenant,
      user,
      membershipId,
      dto,
    );
  }

  @Delete('members/:membershipId')
  removeMember(
    @CurrentUser() user: JwtPayload,
    @CurrentTenant() tenant: TenantContext,
    @Param('membershipId') membershipId: string,
  ) {
    return this.tenantsService.removeMember(tenant, user, membershipId);
  }
}
