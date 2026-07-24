import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CreateRoutineInput = {
  name: string;
  description?: string;
};

export type AddExerciseInput = {
  exerciseId: string;
  exerciseName?: string;
  sets: number;
  reps: string;
  restSeconds?: number;
  notes?: string;
  order?: number;
};

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  // ---- CRUD Rutina ----
  async listByTrainer(trainerId: string, status?: string) {
    return this.prisma.client.routine.findMany({
      where: { trainerId, ...(status ? { status: status as any } : {}) },
      include: { exercises: { orderBy: { order: 'asc' } }, assignments: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async listPublished() {
    return this.prisma.client.routine.findMany({
      where: { status: 'PUBLISHED' },
      include: { exercises: { orderBy: { order: 'asc' } }, trainer: { include: { profile: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async get(id: string) {
    const r = await this.prisma.client.routine.findUnique({
      where: { id },
      include: { exercises: { orderBy: { order: 'asc' } }, trainer: { include: { profile: true } }, versions: { orderBy: { version: 'desc' } } },
    });
    if (!r) throw new NotFoundException('Rutina no encontrada');
    return r;
  }

  async create(trainerId: string, input: CreateRoutineInput) {
    return this.prisma.client.routine.create({
      data: { trainerId, name: input.name, description: input.description, status: 'DRAFT' },
    });
  }

  async update(id: string, trainerId: string, data: { name?: string; description?: string; status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }) {
    await this.assertOwner(id, trainerId);
    return this.prisma.client.routine.update({ where: { id }, data });
  }

  async delete(id: string, trainerId: string) {
    await this.assertOwner(id, trainerId);
    return this.prisma.client.routine.delete({ where: { id } });
  }

  // ---- Exercises dentro de la rutina ----
  async addExercise(routineId: string, trainerId: string, input: AddExerciseInput) {
    await this.assertOwner(routineId, trainerId);
    const order = input.order ?? (await this.prisma.client.routineExercise.count({ where: { routineId } }));
    return this.prisma.client.routineExercise.create({
      data: { routineId, exerciseId: input.exerciseId, exerciseName: input.exerciseName, sets: input.sets, reps: input.reps, restSeconds: input.restSeconds, notes: input.notes, order },
    });
  }

  async updateExercise(routineId: string, exerciseRowId: string, trainerId: string, data: Partial<AddExerciseInput>) {
    await this.assertOwner(routineId, trainerId);
    return this.prisma.client.routineExercise.update({ where: { id: exerciseRowId }, data });
  }

  async removeExercise(routineId: string, exerciseRowId: string, trainerId: string) {
    await this.assertOwner(routineId, trainerId);
    return this.prisma.client.routineExercise.delete({ where: { id: exerciseRowId } });
  }

  // ---- Versionado ----
  async publish(routineId: string, trainerId: string, changeNote?: string) {
    await this.assertOwner(routineId, trainerId);
    const routine = await this.prisma.client.routine.findUnique({ where: { id: routineId }, include: { exercises: { orderBy: { order: 'asc' } }, versions: true } });
    if (!routine) throw new NotFoundException('Rutina no encontrada');
    const nextVersion = (routine.versions.reduce((max, v) => Math.max(max, v.version), 0) || 0) + 1;
    const [updated, version] = await this.prisma.client.$transaction([
      this.prisma.client.routine.update({ where: { id: routineId }, data: { status: 'PUBLISHED' } }),
      this.prisma.client.routineVersion.create({
        data: {
          routineId,
          version: nextVersion,
          exercises: routine.exercises as any,
          changeNote,
        },
      }),
    ]);
    return { routine: updated, version };
  }

  async listVersions(routineId: string) {
    return this.prisma.client.routineVersion.findMany({
      where: { routineId },
      orderBy: { version: 'desc' },
    });
  }

  private async assertOwner(routineId: string, trainerId: string) {
    const r = await this.prisma.client.routine.findUnique({ where: { id: routineId } });
    if (!r) throw new NotFoundException('Rutina no encontrada');
    if (r.trainerId !== trainerId) throw new ForbiddenException('No sos dueño de esta rutina');
    return r;
  }
}