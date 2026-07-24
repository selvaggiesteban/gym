import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WorkoutLogsService } from './workout-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Controller('workout-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutLogsController {
  constructor(private service: WorkoutLogsService, private prisma: PrismaService) {}

  private async resolveMemberId(req: Request): Promise<string> {
    const user = req.user as any;
    const member = await this.prisma.client.member.findUnique({ where: { profileId: user.id } });
    if (!member) throw new Error('Miembro no encontrado');
    return member.id;
  }

  @Roles('MEMBER')
  @Get('mine')
  async mine(@Req() req: Request) {
    const memberId = await this.resolveMemberId(req);
    return this.service.listByMember(memberId);
  }

  @Get('assignment/:id')
  byAssignment(@Param('id') id: string) { return this.service.listByAssignment(id); }

  @Roles('MEMBER')
  @Post()
  async create(@Req() req: Request, @Body() body: any) {
    const memberId = await this.resolveMemberId(req);
    return this.service.create(memberId, body);
  }
}