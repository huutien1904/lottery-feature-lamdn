import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentProvider,
  PaymentStatus,
  PlatformRole,
  SubscriptionStatus,
  TenantRole,
  TenantStatus,
  UserStatus,
} from '@prisma/client';

export class AdminTenantSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

export class AdminPlanSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

export class AdminTenantSubscriptionSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: SubscriptionStatus })
  status!: SubscriptionStatus;

  @ApiProperty({ type: AdminPlanSummaryDto })
  plan!: AdminPlanSummaryDto;

  @ApiProperty()
  createdAt!: Date;
}

export class AdminTenantItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ enum: TenantStatus })
  status!: TenantStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: [AdminTenantSubscriptionSummaryDto] })
  subscriptions!: AdminTenantSubscriptionSummaryDto[];
}

export class AdminMembershipItemDto {
  @ApiProperty({ enum: TenantRole })
  role!: TenantRole;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty({ type: AdminTenantSummaryDto })
  tenant!: AdminTenantSummaryDto;
}

export class AdminUserItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ enum: PlatformRole })
  platformRole!: PlatformRole;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: [AdminMembershipItemDto] })
  memberships!: AdminMembershipItemDto[];
}

export class AdminSubscriptionItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: SubscriptionStatus })
  status!: SubscriptionStatus;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  planId!: string;

  @ApiProperty()
  currentPeriodStart!: Date;

  @ApiProperty()
  currentPeriodEnd!: Date;

  @ApiProperty({ type: AdminTenantSummaryDto })
  tenant!: AdminTenantSummaryDto;

  @ApiProperty({ type: AdminPlanSummaryDto })
  plan!: AdminPlanSummaryDto;

  @ApiProperty()
  createdAt!: Date;
}

export class AdminPaymentSubscriptionSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: SubscriptionStatus })
  status!: SubscriptionStatus;
}

export class AdminPaymentItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  subscriptionId!: string;

  @ApiProperty({ enum: PaymentProvider })
  provider!: PaymentProvider;

  @ApiProperty({ enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty({ example: 199000 })
  amount!: number;

  @ApiProperty({ example: 'VND' })
  currency!: string;

  @ApiProperty({ type: AdminTenantSummaryDto })
  tenant!: AdminTenantSummaryDto;

  @ApiProperty({ type: AdminPaymentSubscriptionSummaryDto })
  subscription!: AdminPaymentSubscriptionSummaryDto;

  @ApiProperty()
  createdAt!: Date;
}

export class AdminAuditActorSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;
}

export class AdminAuditLogItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  entityType!: string;

  @ApiProperty({ nullable: true })
  entityId!: string | null;

  @ApiProperty({ nullable: true })
  tenantId!: string | null;

  @ApiProperty({ nullable: true })
  actorUserId!: string | null;

  @ApiProperty({ nullable: true, type: AdminTenantSummaryDto })
  tenant!: AdminTenantSummaryDto | null;

  @ApiProperty({ nullable: true, type: AdminAuditActorSummaryDto })
  actor!: AdminAuditActorSummaryDto | null;

  @ApiProperty({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  metadata!: Record<string, unknown> | null;

  @ApiProperty({ nullable: true })
  ipAddress!: string | null;

  @ApiProperty({ nullable: true })
  userAgent!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class AdminTenantListDataDto {
  @ApiProperty({ type: [AdminTenantItemDto] })
  items!: AdminTenantItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  offset!: number;

  @ApiProperty()
  limit!: number;
}

export class AdminUserListDataDto {
  @ApiProperty({ type: [AdminUserItemDto] })
  items!: AdminUserItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  offset!: number;

  @ApiProperty()
  limit!: number;
}

export class AdminSubscriptionListDataDto {
  @ApiProperty({ type: [AdminSubscriptionItemDto] })
  items!: AdminSubscriptionItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  offset!: number;

  @ApiProperty()
  limit!: number;
}

export class AdminPaymentListDataDto {
  @ApiProperty({ type: [AdminPaymentItemDto] })
  items!: AdminPaymentItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  offset!: number;

  @ApiProperty()
  limit!: number;
}

export class AdminAuditLogListDataDto {
  @ApiProperty({ type: [AdminAuditLogItemDto] })
  items!: AdminAuditLogItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  offset!: number;

  @ApiProperty()
  limit!: number;
}

export class AdminTenantListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AdminTenantListDataDto })
  data!: AdminTenantListDataDto;
}

export class AdminTenantStatusUpdatedResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AdminTenantItemDto })
  data!: AdminTenantItemDto;
}

export class AdminUserListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AdminUserListDataDto })
  data!: AdminUserListDataDto;
}

export class AdminSubscriptionListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AdminSubscriptionListDataDto })
  data!: AdminSubscriptionListDataDto;
}

export class AdminPaymentListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AdminPaymentListDataDto })
  data!: AdminPaymentListDataDto;
}

export class AdminAuditLogListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AdminAuditLogListDataDto })
  data!: AdminAuditLogListDataDto;
}
