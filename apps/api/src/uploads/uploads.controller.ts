import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentTenant } from '../tenants/decorators/current-tenant.decorator';
import { TenantAccessGuard } from '../tenants/guards/tenant-access.guard';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { ConfirmAvatarUploadDto } from './dto/confirm-avatar-upload.dto';
import { PresignUploadBatchDto } from './dto/presign-upload-batch.dto';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Create one presigned upload payload' })
  @ApiBody({ type: PresignUploadDto })
  @ApiOkResponse({ description: 'Presigned upload payload returned.' })
  @ApiBadRequestResponse({
    description: 'Invalid file metadata or policy violation.',
  })
  @ApiNotFoundResponse({ description: 'Target participant not found.' })
  presignUpload(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PresignUploadDto,
  ) {
    return this.uploadsService.presignUpload(tenant, dto);
  }

  @Post('presign-batch')
  @ApiOperation({
    summary: 'Create multiple presigned upload payloads in one request',
  })
  @ApiBody({ type: PresignUploadBatchDto })
  @ApiOkResponse({ description: 'Batch presigned upload payloads returned.' })
  @ApiBadRequestResponse({
    description: 'Invalid item in batch or policy violation.',
  })
  @ApiNotFoundResponse({
    description: 'Target participant not found for one of items.',
  })
  presignUploadBatch(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: PresignUploadBatchDto,
  ) {
    return this.uploadsService.presignUploadBatch(tenant, dto.items);
  }

  @Post('participant-avatar/confirm')
  @ApiOperation({
    summary: 'Confirm participant avatar upload and persist metadata',
  })
  @ApiBody({ type: ConfirmAvatarUploadDto })
  @ApiOkResponse({
    description: 'Upload metadata persisted and participant avatar updated.',
  })
  @ApiBadRequestResponse({
    description: 'Plan policy or payload validation failed.',
  })
  @ApiNotFoundResponse({
    description: 'Participant not found in current tenant.',
  })
  confirmParticipantAvatarUpload(
    @CurrentTenant() tenant: TenantContext,
    @CurrentUser() actor: JwtPayload,
    @Body() dto: ConfirmAvatarUploadDto,
  ) {
    return this.uploadsService.confirmParticipantAvatarUpload(
      tenant,
      actor,
      dto,
    );
  }
}
