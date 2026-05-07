import { ApiProperty } from '@nestjs/swagger';
import { PlatformRole, UserStatus } from '@prisma/client';

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ enum: PlatformRole })
  platformRole!: PlatformRole;
}

export class AuthTokenDataDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

export class AuthTokenResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AuthTokenDataDto })
  data!: AuthTokenDataDto;
}

export class LogoutDataDto {
  @ApiProperty({ example: true })
  loggedOut!: boolean;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: LogoutDataDto })
  data!: LogoutDataDto;
}

export class TenantSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

export class MembershipSummaryDto {
  @ApiProperty({ example: 'OWNER' })
  role!: string;

  @ApiProperty({ example: true })
  isDefault!: boolean;

  @ApiProperty({ type: TenantSummaryDto })
  tenant!: TenantSummaryDto;
}

export class MeUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ enum: UserStatus })
  status!: UserStatus;

  @ApiProperty({ enum: PlatformRole })
  platformRole!: PlatformRole;

  @ApiProperty({ type: [MembershipSummaryDto] })
  memberships!: MembershipSummaryDto[];
}

export class MeDataDto {
  @ApiProperty({ type: MeUserDto })
  user!: MeUserDto;
}

export class MeResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: MeDataDto })
  data!: MeDataDto;
}

export class AdminPingDataDto {
  @ApiProperty({ example: 'admin access ok' })
  message!: string;
}

export class AdminPingResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: AdminPingDataDto })
  data!: AdminPingDataDto;
}
