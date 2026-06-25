import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsOptional } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: 'owner@company.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ enum: ['vi', 'en'], default: 'vi' })
  @IsOptional()
  @IsIn(['vi', 'en'])
  locale?: 'vi' | 'en';
}
