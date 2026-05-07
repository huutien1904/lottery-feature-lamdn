import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PlatformRole } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { AdminListQueryDto } from './dto/admin-list-query.dto';
import {
  AdminAuditLogListResponseDto,
  AdminPaymentListResponseDto,
  AdminSubscriptionListResponseDto,
  AdminTenantListResponseDto,
  AdminTenantStatusUpdatedResponseDto,
  AdminUserListResponseDto,
} from './dto/admin-responses.dto';
import { UpdateTenantStatusDto } from './dto/update-tenant-status.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PlatformRole.ADMIN, PlatformRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tenants')
  @ApiOperation({ summary: 'List tenants for platform admin' })
  @ApiOkResponse({
    description: 'Tenant list',
    type: AdminTenantListResponseDto,
  })
  listTenants(@Query() query: AdminListQueryDto) {
    return this.adminService.listTenants(query);
  }

  @Patch('tenants/:id/status')
  @ApiOperation({ summary: 'Update tenant status' })
  @ApiParam({ name: 'id', description: 'Tenant ID' })
  @ApiBody({ type: UpdateTenantStatusDto })
  @ApiOkResponse({
    description: 'Tenant status updated',
    type: AdminTenantStatusUpdatedResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Tenant not found' })
  updateTenantStatus(
    @Param('id') tenantId: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    return this.adminService.updateTenantStatus(tenantId, dto);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users for platform admin' })
  @ApiOkResponse({
    description: 'User list',
    type: AdminUserListResponseDto,
  })
  listUsers(@Query() query: AdminListQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: 'List subscriptions for platform admin' })
  @ApiOkResponse({
    description: 'Subscription list',
    type: AdminSubscriptionListResponseDto,
  })
  listSubscriptions(@Query() query: AdminListQueryDto) {
    return this.adminService.listSubscriptions(query);
  }

  @Get('payments')
  @ApiOperation({ summary: 'List payments for platform admin' })
  @ApiOkResponse({
    description: 'Payment list',
    type: AdminPaymentListResponseDto,
  })
  listPayments(@Query() query: AdminListQueryDto) {
    return this.adminService.listPayments(query);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'List audit logs for platform admin' })
  @ApiOkResponse({
    description: 'Audit log list',
    type: AdminAuditLogListResponseDto,
  })
  listAuditLogs(@Query() query: AdminListQueryDto) {
    return this.adminService.listAuditLogs(query);
  }
}
