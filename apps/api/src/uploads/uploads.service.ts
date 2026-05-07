import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UploadPurpose } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { PlanPolicyService } from '../subscriptions/plan-policy.service';
import type { TenantContext } from '../tenants/interfaces/tenant-context.interface';
import { ConfirmAvatarUploadDto } from './dto/confirm-avatar-upload.dto';
import { PresignUploadDto } from './dto/presign-upload.dto';

@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly planPolicy: PlanPolicyService,
    private readonly configService: ConfigService,
  ) {}

  async presignUpload(tenant: TenantContext, dto: PresignUploadDto) {
    this.assertMimeType(dto.purpose, dto.mimeType);
    this.assertSize(dto.purpose, dto.sizeBytes);

    if (dto.purpose === UploadPurpose.PARTICIPANT_AVATAR) {
      await this.planPolicy.assertAvatarUploadAllowed(tenant.tenantId);
      if (!dto.participantId) {
        throw new BadRequestException(
          'participantId is required for participant avatar upload.',
        );
      }
      const participant = await this.prisma.participant.findFirst({
        where: { id: dto.participantId, tenantId: tenant.tenantId },
        select: { id: true },
      });
      if (!participant) {
        throw new NotFoundException('Participant not found in tenant.');
      }
    }

    const ext = this.safeExtension(dto.fileName);
    const key = this.buildObjectKey(
      tenant.tenantId,
      dto.purpose,
      dto.participantId,
      ext,
    );
    const base = this.uploadPublicBaseUrl();

    // This is a provider-agnostic placeholder URL contract for FE integration.
    // Replace with real AWS S3 / R2 signed URL logic when credentials are configured.
    const uploadUrl = `${base}/${key}?presigned=mock&expires_in=900`;
    const publicUrl = `${base}/${key}`;

    return {
      provider: dto.provider,
      purpose: dto.purpose,
      method: 'PUT',
      key,
      uploadUrl,
      publicUrl,
      expiresIn: 900,
      requiredHeaders: {
        'Content-Type': dto.mimeType,
      },
    };
  }

  async presignUploadBatch(tenant: TenantContext, items: PresignUploadDto[]) {
    const presigned = [];
    for (let i = 0; i < items.length; i += 1) {
      // Keep per-item validation and plan enforcement consistent with single presign.
      // Sequential processing also avoids bursty DB checks for participant ownership.
      presigned.push(await this.presignUpload(tenant, items[i]));
    }
    return {
      total: presigned.length,
      items: presigned,
    };
  }

  async confirmParticipantAvatarUpload(
    tenant: TenantContext,
    actor: JwtPayload,
    dto: ConfirmAvatarUploadDto,
  ) {
    await this.planPolicy.assertAvatarUploadAllowed(tenant.tenantId);

    const participant = await this.prisma.participant.findFirst({
      where: { id: dto.participantId, tenantId: tenant.tenantId },
      select: { id: true, eventId: true },
    });
    if (!participant) {
      throw new NotFoundException('Participant not found in tenant.');
    }

    const upload = await this.prisma.upload.create({
      data: {
        tenantId: tenant.tenantId,
        eventId: dto.eventId ?? participant.eventId,
        participantId: participant.id,
        provider: dto.provider,
        purpose: UploadPurpose.PARTICIPANT_AVATAR,
        key: dto.key,
        url: dto.url,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        uploadedByUserId: actor.sub,
      },
    });

    await this.prisma.participant.update({
      where: { id: participant.id },
      data: {
        avatarUrl: dto.url,
        avatarKey: dto.key,
      },
    });

    return { confirmed: true, uploadId: upload.id };
  }

  private uploadPublicBaseUrl() {
    return (
      this.configService.get<string>('UPLOAD_PUBLIC_BASE_URL') ??
      'http://localhost:3001/uploads'
    ).replace(/\/$/, '');
  }

  private safeExtension(fileName: string) {
    const idx = fileName.lastIndexOf('.');
    if (idx < 0) return 'bin';
    return (
      fileName
        .slice(idx + 1)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') || 'bin'
    );
  }

  private buildObjectKey(
    tenantId: string,
    purpose: UploadPurpose,
    participantId: string | undefined,
    ext: string,
  ) {
    const id = randomUUID();
    if (purpose === UploadPurpose.PARTICIPANT_AVATAR) {
      return `tenants/${tenantId}/participants/${participantId}/${id}.${ext}`;
    }
    return `tenants/${tenantId}/${purpose.toLowerCase()}/${id}.${ext}`;
  }

  private assertSize(purpose: UploadPurpose, sizeBytes: number) {
    const max =
      purpose === UploadPurpose.PARTICIPANT_AVATAR
        ? 2 * 1024 * 1024
        : 20 * 1024 * 1024;
    if (sizeBytes > max) {
      throw new BadRequestException(
        `File too large. Max allowed: ${max} bytes.`,
      );
    }
  }

  private assertMimeType(purpose: UploadPurpose, mimeType: string) {
    const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (
      purpose === UploadPurpose.PARTICIPANT_AVATAR &&
      !imageTypes.has(mimeType)
    ) {
      throw new BadRequestException(
        'Avatar only supports image/jpeg, image/png, image/webp.',
      );
    }
  }
}
