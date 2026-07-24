import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RoutineAssignmentsService } from './routine-assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Controller('routine-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutineAssignmentsController {
  constructor(private service: RoutineAssignmentsService, private prisma: PrismaService) {}

  private async resolveTrainerId(req: Request): Promise<string> {
    const user = req.user as any;
    if (user.role === 'ADMIN') {
      const trainer = await this.prisma.client.trainer.findUnique({ where: { profileId: user.id } });
      if (trainer) return trainer.id;
    }
    return this.prisma.resolveTrainerId(user.id);
  }

  @Roles('MEMBER')
  @Get('mine')
  async mine(@Req() req: Request) {
    const user = req.user as any;
    const member = await this.prisma.client.member.findUnique({ where: { profileId: user.id } });
    if (!member) return [];
    return this.service.listByMember(member.id);
  }

  @Roles('ADMIN', 'TRAINER')
  @Get('trainer')
  async byTrainer(@Req() req: Request) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.listByTrainer(trainerId);
  }

  @Roles('ADMIN', 'TRAINER')
  @Post()
  async create(@Req() req: Request, @Body() body: any) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.create(trainerId, body);
  }

  @Roles('ADMIN', 'TRAINER')
  @Delete(':id')
  async deactivate(@Param('id') id: string, @Req() req: Request) {
    const trainerId = await this.resolveTrainerId(req);
    return this.service.deactivate(id, trainerId);
  }
}