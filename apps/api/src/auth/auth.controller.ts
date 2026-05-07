import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PlatformRole } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new owner account and tenant trial' })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
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
