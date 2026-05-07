import { IsOptional, IsString } from 'class-validator';

export class ListDrawSessionsDto {
  @IsOptional()
  @IsString()
  eventId?: string;
}
