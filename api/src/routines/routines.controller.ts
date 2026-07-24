import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Controller('routines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutinesController {
  constructor(private service: RoutinesService, private prisma: PrismaService) {}

  private async resolveTrainerId(req: Request): Promise<string> {
    const user = req.user as any;
    if (user.role === 'ADMIN') {
      const trainer = await this.prisma.client.trainer.findUnique({ where: { profileId: user.id } });
      if (trainer) return trainer.id;
    }
    return this.prisma.resolveTrainerId(user.id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('mine')
  async mine(@Req() req: Request, @Param('status') status?: string) {
    const user = req.user as any;
    if (user.role === 'ADMIN') return this.service.listPublished();
    const trainerId = await this.resolveTrainerId(req);
    return this.service.listByTrainer(trainerId);
  }

  @Roles('TRAINER', 'ADMIN')
  @Get('trainer/:trainerId')
  byTrainer(@Param('trainerId') trainerId: string, @Req() req: Request) {
    return this.service.listByTrainer(trainerId);
  }

  @Get('published')
  published() { return this.service.listPublished(); }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Roles('TRAINER', 'ADMIN')
  @Post()
  async create(@Req() req: Request, @Body() body: any) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.create(trainerId, body);
  }

  @Roles('TRAINER', 'ADMIN')
  @Put(':id')
  async update(@Param('id') id: string, @Req() req: Request, @Body() body: any) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.update(id, trainerId, body);
  }

  @Roles('TRAINER', 'ADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.delete(id, trainerId);
  }

  @Roles('TRAINER', 'ADMIN')
  @Post(':id/exercises')
  async addExercise(@Param('id') id: string, @Req() req: Request, @Body() body: any) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.addExercise(id, trainerId, body);
  }

  @Roles('TRAINER', 'ADMIN')
  @Put(':id/exercises/:exerciseRowId')
  async updateExercise(@Param('id') id: string, @Param('exerciseRowId') rowId: string, @Req() req: Request, @Body() body: any) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.updateExercise(id, rowId, trainerId, body);
  }

  @Roles('TRAINER', 'ADMIN')
  @Delete(':id/exercises/:exerciseRowId')
  async removeExercise(@Param('id') id: string, @Param('exerciseRowId') rowId: string, @Req() req: Request) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.removeExercise(id, rowId, trainerId);
  }

  @Roles('TRAINER', 'ADMIN')
  @Post(':id/publish')
  async publish(@Param('id') id: string, @Req() req: Request, @Body('changeNote') note?: string) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.publish(id, trainerId, note);
  }

  @Get(':id/versions')
  versions(@Param('id') id: string) { return this.service.listVersions(id); }
}