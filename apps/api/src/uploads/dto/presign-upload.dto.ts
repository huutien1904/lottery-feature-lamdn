import { UploadProvider, UploadPurpose } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class PresignUploadDto {
  @IsEnum(UploadProvider)
  provider!: UploadProvider;

  @IsEnum(UploadPurpose)
  purpose!: UploadPurpose;

  @IsString()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @MaxLength(120)
  mimeType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  participantId?: string;
}
