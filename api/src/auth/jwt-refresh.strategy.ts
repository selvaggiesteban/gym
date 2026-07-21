import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

type RefreshPayload = { sub: string; email?: string; role?: string };

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => req?.cookies?.['refresh_token'] ?? null,
      ]),
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: RefreshPayload) {
    const profile = await this.prisma.client.profile.findUnique({ where: { id: payload.sub } });
    if (!profile || !profile.isActive) throw new UnauthorizedException();
    return { id: profile.id, email: profile.email, role: profile.role, name: profile.name };
  }
}
