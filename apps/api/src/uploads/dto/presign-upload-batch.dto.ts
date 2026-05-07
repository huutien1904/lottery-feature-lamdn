import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';

import { PresignUploadDto } from './presign-upload.dto';

export class PresignUploadBatchDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PresignUploadDto)
  items!: PresignUploadDto[];
}
