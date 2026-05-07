import { IsString, MinLength } from 'class-validator';

export class SwitchTenantDto {
  @IsString()
  @MinLength(3)
  tenantId!: string;
}
