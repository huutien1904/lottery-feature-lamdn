import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DrawWinnerDto {
  @IsString()
  participantId!: string;

  @IsString()
  prizeId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rankNo?: number;
}

export class CompleteDrawSessionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DrawWinnerDto)
  results!: DrawWinnerDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
