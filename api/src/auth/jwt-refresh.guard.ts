import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { verifyToken, parseCookies } from './jwt.utils';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
  constructor(private config: ConfigService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookies = parseCookies(request.headers?.get?.('cookie') || request.headers?.cookie || '');
    const token = cookies['refresh_token'];
    if (!token) throw new UnauthorizedException('Refresh token requerido');

    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const payload = await verifyToken(token, secret);
    if (!payload) throw new UnauthorizedException('Refresh token invalido o expirado');

    const profile = await this.prisma.client.profile.findUnique({ where: { id: payload.sub as string } });
    if (!profile || !profile.isActive) throw new UnauthorizedException('Perfil inactivo');

    request.user = { id: profile.id, email: profile.email, role: profile.role, name: profile.name };
    return true;
  }
}
