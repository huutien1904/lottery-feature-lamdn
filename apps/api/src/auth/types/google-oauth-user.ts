import type { PlatformRole } from '@prisma/client';

/** Attached to `req.user` after Google OAuth `validate()`. */
export type GoogleOAuthUser = {
  id: string;
  email: string;
  fullName: string;
  platformRole: PlatformRole;
  isNew: boolean;
};
