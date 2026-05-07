import { PlatformRole } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  platformRole: PlatformRole;
}
