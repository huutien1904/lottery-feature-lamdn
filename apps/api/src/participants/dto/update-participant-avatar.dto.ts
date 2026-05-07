import { IsOptional, IsString } from 'class-validator';

export class UpdateParticipantAvatarDto {
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  avatarKey?: string;
}
