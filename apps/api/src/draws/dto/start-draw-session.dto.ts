import { IsOptional, IsString } from 'class-validator';

export class StartDrawSessionDto {
  @IsString()
  eventId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
