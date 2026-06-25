import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

/**
 * Starts the Google OAuth flow and forwards `locale` (`vi` | `en`) as OAuth `state`
 * so the callback can redirect back to the correct Next.js locale segment.
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  override getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const raw = req.query['locale'];
    const locale =
      typeof raw === 'string' && (raw === 'vi' || raw === 'en') ? raw : 'vi';
    return {
      scope: ['email', 'profile'],
      state: locale,
      prompt: 'select_account' as const,
    };
  }
}
