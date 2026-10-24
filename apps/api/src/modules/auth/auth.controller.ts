import { Controller, Post, Body, Get, UseGuards, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { getEnv, APP_CONSTANTS } from '@gq/config';
import { RegisterRequestSchema, LoginRequestSchema, RefreshRequestSchema } from '@gq/contracts';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema)) dto: { email: string; phone: string; password: string; fullName: string; dateOfBirth?: string }
  ) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) dto: { identifier: string; password: string; rememberMe?: boolean },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(dto);
    this.setTokenCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(RefreshRequestSchema)) dto: { refreshToken: string },
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.refresh(dto.refreshToken);
    this.setTokenCookies(res, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logout(userId);
    this.clearTokenCookies(res);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: { id: string; email: string; phone: string; fullName: string; roles: string[]; mfaEnabled: boolean }) {
    return user;
  }

  private setTokenCookies(res: Response, access: string, refresh: string) {
    const env = getEnv();
    const isSecure = env.SESSION_COOKIE_SECURE;
    const accessTtl = parseInt(env.JWT_ACCESS_TTL.replace(/\D/g, ''), 10) * (env.JWT_ACCESS_TTL.endsWith('m') ? 60 : env.JWT_ACCESS_TTL.endsWith('h') ? 3600 : 86400);
    const refreshTtl = parseInt(env.JWT_REFRESH_TTL.replace(/\D/g, ''), 10) * (env.JWT_REFRESH_TTL.endsWith('m') ? 60 : env.JWT_REFRESH_TTL.endsWith('h') ? 3600 : 86400);
    res.cookie(APP_CONSTANTS.ACCESS_TOKEN_COOKIE, access, {
      httpOnly: true,
      secure: isSecure,
      sameSite: env.SESSION_COOKIE_SAME_SITE,
      maxAge: accessTtl * 1000,
    });
    res.cookie(APP_CONSTANTS.REFRESH_TOKEN_COOKIE, refresh, {
      httpOnly: true,
      secure: isSecure,
      sameSite: env.SESSION_COOKIE_SAME_SITE,
      maxAge: refreshTtl * 1000,
    });
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie(APP_CONSTANTS.ACCESS_TOKEN_COOKIE);
    res.clearCookie(APP_CONSTANTS.REFRESH_TOKEN_COOKIE);
  }
}