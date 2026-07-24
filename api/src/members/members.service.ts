import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

export type CreateMemberInput = {
  email: string;
  password: string;
  name: string;
  whatsapp?: string;
  birthDate?: string;
};

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.client.member.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    let m = await this.prisma.client.member.findUnique({ where: { id }, include: { profile: true } });
    if (!m) m = await this.prisma.client.member.findUnique({ where: { profileId: id }, include: { profile: true } });
    if (!m) throw new NotFoundException('Miembro no encontrado');
    return m;
  }

  async create(input: CreateMemberInput) {
    const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
    return this.prisma.client.profile.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name,
        whatsapp: input.whatsapp,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        role: 'MEMBER',
        member: { create: { memberCode: await this.code(), status: 'expired' } },
      },
      include: { member: true },
    });
  }

  async update(id: string, data: { name?: string; whatsapp?: string; birthDate?: string; isActive?: boolean }) {
    const m = await this.prisma.client.member.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Miembro no encontrado');
    return this.prisma.client.profile.update({
      where: { id: m.profileId },
      data: {
        name: data.name,
        whatsapp: data.whatsapp,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        isActive: data.isActive,
      },
      include: { member: true },
    });
  }

  async archive(id: string) {
    const m = await this.prisma.client.member.findUnique({ where: { id } });
    if (!m) throw new NotFoundException('Miembro no encontrado');
    await this.prisma.client.profile.update({ where: { id: m.profileId }, data: { isActive: false } });
    return { ok: true };
  }

  async findByCode(memberCode: string) {
    return this.prisma.client.member.findUnique({ where: { memberCode }, include: { profile: true } });
  }

  private async code(): Promise<string> {
    for (let i = 0; i < 20; i++) {
      const n = String(Math.floor(Math.random() * 9000) + 1000);
      const dup = await this.prisma.client.member.findUnique({ where: { memberCode: n } });
      if (!dup) return n;
    }
    throw new Error('No se pudo generar memberCode');
  }
}