import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto, ResetPasswordRequestDto, UpdatePasswordDto, ConfirmResetPasswordDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000; // 15 min
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function cookieOptions(config: ConfigService) {
  return {
    httpOnly: true,
    secure: config.get<string>('COOKIE_SECURE') === 'true',
    sameSite: 'lax' as const,
    domain: config.get<string>('COOKIE_DOMAIN') || undefined,
    path: '/',
  };
}

function setCookies(config: ConfigService, res: Response, access: string, refresh: string) {
  const opts = cookieOptions(config);
  res.cookie('access_token', access, { ...opts, maxAge: ACCESS_MAX_AGE_MS });
  res.cookie('refresh_token', refresh, { ...opts, maxAge: REFRESH_MAX_AGE_MS });
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private config: ConfigService) {}

  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto, @Res({ passthrough: true }) res: Response) {
    const t = await this.authService.signUp(dto);
    setCookies(this.config, res, t.accessToken, t.refreshToken);
    return { profile: t.profile };
  }

  @Post('sign-in')
  async signIn(@Body() dto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const t = await this.authService.signIn(dto);
    setCookies(this.config, res, t.accessToken, t.refreshToken);
    return { profile: t.profile };
  }

  @Post('sign-out')
  async signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { ok: true };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as { id: string; email: string; role: string };
    const t = await this.authService.refresh({ sub: user.id, email: user.email, role: user.role });
    setCookies(this.config, res, t.accessToken, t.refreshToken);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user;
  }

  @Post('password-reset/request')
  async requestReset(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('password-reset/confirm')
  async confirmReset(@Body() dto: ConfirmResetPasswordDto) {
    return this.authService.confirmPasswordReset(dto.token, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('password')
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    const user = req.user as { id: string };
    return this.authService.updatePassword(user.id, dto);
  }
}
