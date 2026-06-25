import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import { AuthService } from '../auth.service';
import type { GoogleOAuthUser } from '../types/google-oauth-user';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      /** Google’s documented endpoint; `oauth2/v4/token` can fail from some runtimes. */
      tokenURL: 'https://oauth2.googleapis.com/token',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const emails = profile.emails ?? [];
      const primary =
        emails.find((e) => e.verified)?.value ?? emails[0]?.value ?? null;
      if (!primary) {
        done(new Error('Google account has no email address.'), undefined);
        return;
      }

      const emailVerifiedFromGoogle =
        emails.find((e) => e.value === primary)?.verified === true;

      const fullName =
        profile.displayName?.trim() ||
        profile.name?.givenName ||
        primary.split('@')[0] ||
        'User';

      const user: GoogleOAuthUser = await this.authService.provisionGoogleUser({
        googleId: profile.id,
        email: primary.toLowerCase(),
        fullName,
        avatarUrl: profile.photos?.[0]?.value ?? null,
        emailVerifiedFromGoogle,
      });

      done(null, user);
    } catch (err) {
      this.logger.warn(
        `Google OAuth validate failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      done(err as Error, undefined);
    }
  }
}
