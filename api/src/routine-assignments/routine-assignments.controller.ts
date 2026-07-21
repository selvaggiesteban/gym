import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RoutineAssignmentsService } from './routine-assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('routine-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutineAssignmentsController {
  constructor(private service: RoutineAssignmentsService) {}

  @Roles('MEMBER')
  @Get('mine')
  mine(@Req() req: Request) { return this.service.listByMember((req.user as any).memberId); }

  @Roles('ADMIN', 'TRAINER')
  @Get('trainer')
  byTrainer(@Req() req: Request) { return this.service.listByTrainer((req.user as any).id); }

  @Roles('ADMIN', 'TRAINER')
  @Post()
  create(@Req() req: Request, @Body() body: any) { return this.service.create((req.user as any).id, body); }

  @Roles('ADMIN', 'TRAINER')
  @Delete(':id')
  deactivate(@Param('id') id: string, @Req() req: Request) { return this.service.deactivate(id, (req.user as any).id); }
}