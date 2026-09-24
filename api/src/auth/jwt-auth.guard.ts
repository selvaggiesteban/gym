import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { verifyToken, parseCookies } from './jwt.utils';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private config: ConfigService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) throw new UnauthorizedException('Token requerido');

    const secret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const payload = await verifyToken(token, secret);
    if (!payload) throw new UnauthorizedException('Token invalido o expirado');

    const profile = await this.prisma.client.profile.findUnique({ where: { id: payload.sub as string } });
    if (!profile || !profile.isActive) throw new UnauthorizedException('Perfil inactivo');

    request.user = { id: profile.id, email: profile.email, role: profile.role, name: profile.name };
    return true;
  }

  private extractToken(request: any): string | null {
    const cookies = parseCookies(request.headers?.get?.('cookie') || request.headers?.cookie || '');
    const fromCookie = cookies['access_token'];
    if (fromCookie) return fromCookie;

    const auth = request.headers?.get?.('authorization') || request.headers?.authorization;
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7);
    return null;
  }
}
