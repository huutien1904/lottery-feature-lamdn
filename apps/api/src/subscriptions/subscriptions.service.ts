import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { PlanPolicyService } from './plan-policy.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policy: PlanPolicyService,
  ) {}

  async currentPlan(tenantId: string) {
    const sub = await this.policy.currentPlan(tenantId);
    return {
      subscription: {
        id: sub.id,
        status: sub.status,
        trialStartAt: sub.trialStartAt,
        trialEndAt: sub.trialEndAt,
        currentPeriodStart: sub.currentPeriodStart,
        currentPeriodEnd: sub.currentPeriodEnd,
      },
      plan: {
        code: sub.plan.code,
        name: sub.plan.name,
        trialDays: sub.plan.trialDays,
        maxParticipantsPerEvent: sub.plan.maxParticipantsPerEvent,
        allowParticipantAvatar: sub.plan.allowParticipantAvatar,
        allowLargeImport: sub.plan.allowLargeImport,
        maxImportRows: sub.plan.maxImportRows,
      },
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expireTrials() {
    const now = new Date();
    await this.prisma.subscription.updateMany({
      where: {
        status: SubscriptionStatus.TRIALING,
        trialEndAt: { lt: now },
      },
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });
  }
}
