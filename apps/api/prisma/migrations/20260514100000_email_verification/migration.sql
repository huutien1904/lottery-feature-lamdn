-- Email verification token fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerificationExpiresAt" TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerificationToken_key" ON "User"("emailVerificationToken");
