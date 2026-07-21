import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CheckInResult = { ok: true; member: any } | { ok: false; reason: string };

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkInByCode(memberCode: string): Promise<CheckInResult> {
    const m = await this.prisma.client.member.findUnique({ where: { memberCode }, include: { profile: true } });
    if (!m) {
      await this.prisma.client.failedAccessAttempt.create({ data: { reason: 'codigo_invalido', memberId: null, attemptTime: new Date() } });
      return { ok: false, reason: 'CÃ³digo invÃ¡lido' };
    }
    if (!m.profile.isActive) {
      await this.prisma.client.failedAccessAttempt.create({ data: { reason: 'perfil_inactivo', memberId: m.id, attemptTime: new Date() } });
      return { ok: false, reason: 'Miembro inactivo' };
    }
    if (!m.expiryDate || m.expiryDate < new Date()) {
      await this.prisma.client.failedAccessAttempt.create({ data: { reason: 'membresia_vencida', memberId: m.id, attemptTime: new Date() } });
      return { ok: false, reason: 'MembresÃ­a vencida' };
    }
    const attendance = await this.prisma.client.attendance.create({ data: { memberId: m.id } });
    return { ok: true, member: { ...m, attendance } };
  }

  list() {
    return this.prisma.client.attendance.findMany({
      include: { member: { include: { profile: true } } },
      orderBy: { checkInTime: 'desc' },
      take: 200,
    });
  }

  failedAttempts() {
    return this.prisma.client.failedAccessAttempt.findMany({ orderBy: { attemptTime: 'desc' }, take: 50 });
  }

  async overview() {
    const [activeMembers, expiredMembers, todayAttendance, monthRevenue] = await Promise.all([
      this.prisma.client.member.count({ where: { status: 'paid' } }),
      this.prisma.client.member.count({ where: { status: 'expired' } }),
      this.prisma.client.attendance.count({ where: { checkInTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      this.prisma.client.payment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
    ]);
    return {
      activeMembers,
      expiredMembers,
      todayAttendance,
      monthRevenue: monthRevenue._sum.amount ?? 0,
    };
  }
}