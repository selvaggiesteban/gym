import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto, UpdatePasswordDto, ResetPasswordRequestDto } from './dto';

const DEFAULT_MEMBER_STATUS = 'expired';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: SignUpDto) {
    const exists = await this.prisma.client.profile.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email ya registrado');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
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
    const ok = await argon2.verify(profile.passwordHash, dto.password);
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
    const reset = await this.jwt.signAsync(
      { sub: profile.id, email: profile.email },
      { expiresIn: '15m' as any },
    );
    return { resetToken: reset, ok: true };
  }

  async updatePassword(userId: string, dto: UpdatePasswordDto) {
    const profile = await this.prisma.client.profile.findUnique({ where: { id: userId } });
    if (!profile) throw new NotFoundException('Usuario no encontrado');
    const hash = await argon2.hash(dto.password, { type: argon2.argon2id });
    await this.prisma.client.profile.update({ where: { id: userId }, data: { passwordHash: hash } });
    return { ok: true };
  }

  private async generateMemberCode(): Promise<string> {
    let attempts = 0;
    while (attempts < 20) {
      const codeNum = Math.floor(Math.random() * 9000) + 1000; // 1000..9999 (4 digitos)
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

    // El secret por defecto viene del JwtModule.registerAsync (JWT_ACCESS_SECRET),
    // para el refresh usamos signAsync con secret explícito (distinta clave).
    const [accessToken, refreshToken, profile] = await Promise.all([
      this.jwt.signAsync({ sub, email, role }, { expiresIn: accessTtl as any }),
      this.jwt.signAsync(
        { sub, email, role },
        { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: refreshTtl as any },
      ),
      this.prisma.client.profile.findUnique({ where: { id: sub }, include: { member: true, trainer: true } }),
    ]);

    return { accessToken, refreshToken, profile };
  }
}
