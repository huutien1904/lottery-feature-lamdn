import { UploadProvider } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ConfirmAvatarUploadDto {
  @IsString()
  participantId!: string;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsEnum(UploadProvider)
  provider!: UploadProvider;

  @IsString()
  key!: string;

  @IsString()
  url!: string;

  @IsString()
  mimeType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;
}
