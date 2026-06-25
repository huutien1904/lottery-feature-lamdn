import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlatformRole } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import {
  AdminPingResponseDto,
  AuthTokenResponseDto,
  LogoutResponseDto,
  MeResponseDto,
} from './dto/auth-responses.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { GoogleOAuthUser } from './types/google-oauth-user';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiExcludeEndpoint()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  googleAuth(): void {
    /* Redirect is issued by Passport inside the guard. */
  }

  @ApiExcludeEndpoint()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request & { user: GoogleOAuthUser },
    @Res() res: Response,
  ): Promise<void> {
    const webOrigin =
      this.configService.get<string>('WEB_APP_ORIGIN') ??
      'http://localhost:3000';
    const stateRaw = req.query['state'];
    const locale = stateRaw === 'vi' || stateRaw === 'en' ? stateRaw : 'vi';

    const tokens = await this.authService.issueGoogleOAuthTokens(req.user);
    const hash = new URLSearchParams({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      is_new: req.user.isNew ? '1' : '0',
    }).toString();
    const target = `${webOrigin.replace(/\/$/, '')}/${locale}/auth/google-callback#${hash}`;
    res.redirect(302, target);
  }

  @ApiOperation({
    summary: 'Register a new owner account — sends verification email',
  })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'Verify email address with token from verification email',
  })
  @ApiBody({ type: VerifyEmailDto })
  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiBody({ type: ResendVerificationDto })
  @Post('resend-verification')
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email, dto.locale ?? 'vi');
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or email not verified.',
  })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Refresh access token with refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token.' })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout current session' })
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Post('logout')
  logout(@CurrentUser() payload: JwtPayload) {
    return this.authService.logout(payload);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Get('me')
  me(@CurrentUser() payload: JwtPayload) {
    return this.authService.me(payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(PlatformRole.ADMIN, PlatformRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admin role check endpoint' })
  @ApiOkResponse({ type: AdminPingResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized or missing role.' })
  @Get('admin/ping')
  adminPing() {
    return { success: true, data: { message: 'admin access ok' } };
  }
}
