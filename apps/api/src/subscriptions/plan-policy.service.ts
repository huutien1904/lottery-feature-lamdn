import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlanPolicyService {
  constructor(private readonly prisma: PrismaService) {}

  async currentPlan(tenantId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        tenantId,
        status: {
          in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE],
        },
      },
      orderBy: [{ currentPeriodEnd: 'desc' }, { createdAt: 'desc' }],
      include: { plan: true },
    });
    if (!subscription) {
      throw new BadRequestException('No active subscription found for tenant.');
    }
    return subscription;
  }

  async assertParticipantLimit(tenantId: string, nextParticipantCount: number) {
    const { plan } = await this.currentPlan(tenantId);
    if (
      typeof plan.maxParticipantsPerEvent === 'number' &&
      nextParticipantCount > plan.maxParticipantsPerEvent
    ) {
      throw new ForbiddenException(
        `Plan limit exceeded: max ${plan.maxParticipantsPerEvent} participants/event.`,
      );
    }
  }

  async assertAvatarUploadAllowed(tenantId: string) {
    const { plan } = await this.currentPlan(tenantId);
    if (!plan.allowParticipantAvatar) {
      throw new ForbiddenException(
        'Current plan does not allow participant avatar upload.',
      );
    }
  }
}
