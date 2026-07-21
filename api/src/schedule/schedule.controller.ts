import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('schedule')
export class ScheduleController {
  constructor(private service: ScheduleService) {}

  @Get()
  list() { return this.service.list(); }

  @Roles('ADMIN')
  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }

  @Roles('ADMIN')
  @Post('reset-week')
  resetWeek() { return this.service.resetWeek(); }

  @UseGuards(JwtAuthGuard)
  @Post(':id/book')
  book(@Param('id') id: string, @Body('memberId') memberId: string) { return this.service.book(id, memberId); }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unbook')
  unbook(@Param('id') id: string, @Body('memberId') memberId: string) { return this.service.unbook(id, memberId); }
}