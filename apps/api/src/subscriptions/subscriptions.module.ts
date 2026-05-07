import { Module } from '@nestjs/common';

import { SubscriptionsController } from './subscriptions.controller';
import { PlanPolicyService } from './plan-policy.service';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PlanPolicyService],
  exports: [PlanPolicyService, SubscriptionsService],
})
export class SubscriptionsModule {}
