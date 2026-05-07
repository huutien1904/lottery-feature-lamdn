import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelDrawSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
