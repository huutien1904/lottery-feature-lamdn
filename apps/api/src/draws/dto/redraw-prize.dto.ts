import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RedrawWinnerDto {
  @IsString()
  participantId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rankNo?: number;
}

export class RedrawPrizeDto {
  @IsString()
  prizeId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RedrawWinnerDto)
  winners!: RedrawWinnerDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
