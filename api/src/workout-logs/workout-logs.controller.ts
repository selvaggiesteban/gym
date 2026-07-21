import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WorkoutLogsService } from './workout-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Request } from 'express';

@Controller('workout-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutLogsController {
  constructor(private service: WorkoutLogsService) {}

  @Roles('MEMBER')
  @Get('mine')
  mine(@Req() req: Request) { return this.service.listByMember((req.user as any).memberId); }

  @Get('assignment/:id')
  byAssignment(@Param('id') id: string) { return this.service.listByAssignment(id); }

  @Roles('MEMBER')
  @Post()
  create(@Req() req: Request, @Body() body: any) { return this.service.create((req.user as any).memberId, body); }
}