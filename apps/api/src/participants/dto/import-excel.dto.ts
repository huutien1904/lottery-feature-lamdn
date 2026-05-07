import { IsString } from 'class-validator';

export class ImportExcelDto {
  @IsString()
  eventId!: string;
}
