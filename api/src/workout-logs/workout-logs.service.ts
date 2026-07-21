import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CreateLogInput = {
  assignmentId: string;
  routineId: string;
  exerciseId: string;
  routineExerciseId?: string;
  completedReps?: number;
  weight?: number;
  durationSeconds?: number;
  notes?: string;
};

@Injectable()
export class WorkoutLogsService {
  constructor(private prisma: PrismaService) {}

  listByMember(memberId: string) {
    return this.prisma.client.workoutLog.findMany({
      where: { memberId },
      orderBy: { date: 'desc' },
      take: 500,
    });
  }

  listByAssignment(assignmentId: string) {
    return this.prisma.client.workoutLog.findMany({
      where: { assignmentId },
      orderBy: { date: 'asc' },
    });
  }

  async create(memberId: string, input: CreateLogInput) {
    const assignment = await this.prisma.client.routineAssignment.findUnique({ where: { id: input.assignmentId } });
    if (!assignment) throw new NotFoundException('Asignacion no encontrada');
    if (assignment.memberId !== memberId) throw new Error('No autorizado');
    return this.prisma.client.workoutLog.create({
      data: {
        memberId,
        assignmentId: input.assignmentId,
        routineId: input.routineId,
        exerciseId: input.exerciseId,
        routineExerciseId: input.routineExerciseId,
        completedReps: input.completedReps,
        weight: input.weight,
        durationSeconds: input.durationSeconds,
        notes: input.notes,
      },
    });
  }
}