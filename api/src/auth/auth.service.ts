import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { hashPassword, verifyPassword } from './password.utils';
import { signAccessToken, signRefreshToken, verifyToken } from './jwt.utils';
import { SignInDto, SignUpDto, UpdatePasswordDto, ResetPasswordRequestDto } from './dto';

const DEFAULT_MEMBER_STATUS = 'expired';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async signUp(dto: SignUpDto) {
    const exists = await this.prisma.client.profile.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const passwordHash = await hashPassword(dto.password);
    const profile = await this.prisma.client.profile.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        whatsapp: dto.whatsapp,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        role: 'MEMBER',
        member: {
          create: {
            memberCode: await this.generateMemberCode(),
            status: DEFAULT_MEMBER_STATUS,
          },
        },
      },
      include: { member: true },
    });

    return this.issueTokens(profile.id, profile.email, profile.role);
  }

  async signIn(dto: SignInDto) {
    const profile = await this.prisma.client.profile.findUnique({ where: { email: dto.email } });
    if (!profile) throw new UnauthorizedException('Credenciales invalidas');
    const ok = await verifyPassword(dto.password, profile.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciales invalidas');
    if (!profile.isActive) throw new UnauthorizedException('Cuenta desactivada');

    return this.issueTokens(profile.id, profile.email, profile.role);
  }

  async refresh(payload: { sub: string; email: string; role: string }) {
    return this.issueTokens(payload.sub, payload.email, payload.role as any);
  }

  async requestPasswordReset(dto: ResetPasswordRequestDto) {
    const profile = await this.prisma.client.profile.findUnique({ where: { email: dto.email } });
    if (!profile) return { ok: true };
    const resetToken = await signAccessToken(
      { sub: profile.id, email: profile.email, role: profile.role },
      this.config.getOrThrow('JWT_REFRESH_SECRET'),
      '15m',
    );
    const frontendUrl = this.config.get<string>('CORS_ORIGIN', 'http://localhost:5173');
    await this.mail.sendPasswordReset(profile.email, resetToken, frontendUrl);
    return { ok: true };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    const secret = this.config.getOrThrow('JWT_REFRESH_SECRET');
    const payload = await verifyToken(token, secret);
    if (!payload) throw new BadRequestException('Token invalido o expirado');

    const profile = await this.prisma.client.profile.findUnique({ where: { id: payload.sub as string } });
    if (!profile) throw new NotFoundException('Usuario no encontrado');
    const hash = await hashPassword(newPassword);
    await this.prisma.client.profile.update({ where: { id: payload.sub as string }, data: { passwordHash: hash } });
    return { ok: true };
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const profile = await this.prisma.client.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new NotFoundException('Usuario no encontrado');
    const hash = await hashPassword(dto.password);
    await this.prisma.client.profile.update({ where: { id: userId }, data: { passwordHash: hash } });
    return { ok: true };
  }

  private async generateMemberCode(): Promise<string> {
    let attempts = 0;
    while (attempts < 20) {
      const codeNum = Math.floor(Math.random() * 9000) + 1000;
      const dup = await this.prisma.client.member.findUnique({ where: { memberCode: String(codeNum) } });
      if (!dup) return String(codeNum);
      attempts++;
    }
    throw new Error('No se pudo generar memberCode');
  }

  private async issueTokens(
    sub: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string; profile: any }> {
    const accessTtl = this.config.get<string>('JWT_ACCESS_TTL', '15m');
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '7d');
    const accessSecret = this.config.getOrThrow('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken, profile] = await Promise.all([
      signAccessToken({ sub, email, role }, accessSecret, accessTtl),
      signRefreshToken({ sub, email, role }, refreshSecret, refreshTtl),
      this.prisma.client.profile.findUnique({ where: { id: sub }, include: { member: true, trainer: true } }),
    ]);

    return { accessToken, refreshToken, profile };
  }
}
