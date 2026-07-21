import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

type JwtPayload = { sub: string; email: string; role: string };

function cookieExtractor(req: any): string | null {
  let token: string | null = null;
  if (req && req.cookies) {
    token = req.cookies['access_token'] ?? null;
  }
  if (!token && req && req.headers.authorization) {
    const h = req.headers.authorization;
    if (typeof h === 'string' && h.startsWith('Bearer ')) token = h.slice(7);
  }
  return token;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const profile = await this.prisma.client.profile.findUnique({ where: { id: payload.sub } });
    if (!profile || !profile.isActive) throw new UnauthorizedException('Perfil inactivo o inexistente');
    return { id: profile.id, email: profile.email, role: profile.role, name: profile.name };
  }
}
