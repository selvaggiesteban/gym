import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CreateAssignmentInput = {
  memberId: string;
  routineId: string;
  dueDate?: string;
  notes?: string;
};

@Injectable()
export class RoutineAssignmentsService {
  constructor(private prisma: PrismaService) {}

  listByMember(memberId: string) {
    return this.prisma.client.routineAssignment.findMany({
      where: { memberId, isActive: true },
      include: { routine: { include: { exercises: { orderBy: { order: 'asc' } } } }, trainer: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  listByTrainer(trainerId: string) {
    return this.prisma.client.routineAssignment.findMany({
      where: { trainerId },
      include: { member: { include: { profile: true } }, routine: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(trainerId: string, input: CreateAssignmentInput) {
    return this.prisma.client.routineAssignment.create({
      data: {
        memberId: input.memberId,
        routineId: input.routineId,
        trainerId,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        notes: input.notes,
      },
      include: { routine: true, member: { include: { profile: true } } },
    });
  }

  async deactivate(id: string, trainerId: string) {
    const a = await this.prisma.client.routineAssignment.findUnique({ where: { id } });
    if (!a) throw new NotFoundException('Asignacion no encontrada');
    if (a.trainerId !== trainerId) throw new Error('No autorizado');
    return this.prisma.client.routineAssignment.update({ where: { id }, data: { isActive: false } });
  }
}