import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ImportParticipantItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  participantCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ImportParticipantsDto {
  @IsString()
  eventId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100000)
  @ValidateNested({ each: true })
  @Type(() => ImportParticipantItemDto)
  participants!: ImportParticipantItemDto[];
}
