import { IsOptional, IsString } from 'class-validator';

export class ListParticipantsDto {
  @IsOptional()
  @IsString()
  eventId?: string;
}
