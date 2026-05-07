import { Module } from '@nestjs/common';

import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [SubscriptionsModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
