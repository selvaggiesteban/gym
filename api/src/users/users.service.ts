import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async listUsers(role?: string) {
    return this.prisma.client.profile.findMany({
      where: role ? { role: role as any } : undefined,
      include: { member: true, trainer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setRole(id: string, role: 'ADMIN' | 'TRAINER' | 'MEMBER') {
    const profile = await this.prisma.client.profile.findUnique({ where: { id }, include: { trainer: true } });
    if (!profile) throw new NotFoundException('Usuario no encontrado');
    if (role === 'TRAINER' && !profile.trainer) {
      await this.prisma.client.trainer.create({ data: { profileId: profile.id } });
    }
    return this.prisma.client.profile.update({ where: { id }, data: { role } });
  }

  async sync() {
    const profiles = await this.prisma.client.profile.findMany();
    let created = 0;
    for (const p of profiles) {
      if (p.role === 'MEMBER' && !(await this.prisma.client.member.findUnique({ where: { profileId: p.id } }))) {
        await this.prisma.client.member.create({ data: { profileId: p.id, memberCode: await this.code() } });
        created++;
      }
    }
    return { synced: created, total: profiles.length };
  }

  private async code(): Promise<string> {
    for (let i = 0; i < 20; i++) {
      const n = String(Math.floor(Math.random() * 9000) + 1000);
      const dup = await this.prisma.client.member.findUnique({ where: { memberCode: n } });
      if (!dup) return n;
    }
    throw new BadRequestException('No se pudo generar memberCode');
  }
}