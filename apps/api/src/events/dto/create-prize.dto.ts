import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePrizeDto {
  @IsString()
  @MaxLength(80)
  code!: string;

  @IsString()
  @MaxLength(160)
  name!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
