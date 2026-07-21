import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  list() { return this.prisma.client.scheduleClass.findMany({ include: { bookings: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }); }

  create(data: { className: string; dayOfWeek: string; startTime: string; instructor: string; maxCapacity?: number }) {
    return this.prisma.client.scheduleClass.create({ data: { ...data, maxCapacity: data.maxCapacity ?? 20 } });
  }

  async update(id: string, data: any) {
    return this.prisma.client.scheduleClass.update({ where: { id }, data });
  }

  async delete(id: string) { return this.prisma.client.scheduleClass.delete({ where: { id } }); }

  async resetWeek() {
    await this.prisma.client.classBooking.deleteMany({});
    return { ok: true };
  }

  async bookingsCount(classId: string) {
    return this.prisma.client.classBooking.count({ where: { classId } });
  }

  async book(classId: string, memberId: string) {
    const exists = await this.prisma.client.classBooking.findUnique({ where: { classId_memberId: { classId, memberId } } });
    if (exists) throw new NotFoundException('Ya reservado');
    return this.prisma.client.classBooking.create({ data: { classId, memberId } });
  }

  async unbook(classId: string, memberId: string) {
    return this.prisma.client.classBooking.deleteMany({ where: { classId, memberId } });
  }
}