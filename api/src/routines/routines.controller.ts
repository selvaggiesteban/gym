import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('routines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoutinesController {
  constructor(private service: RoutinesService) {}

  @Roles('ADMIN', 'TRAINER')
  @Get('mine')
  mine(@Req() req: Request, @Param('status') status?: string) {
    const user = req.user as any;
    if (user.role === 'ADMIN') return this.service.listPublished();
    return this.service.listByTrainer(user.trainerId || user.id);
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
  create(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return this.service.create(user.id, body);
  }

  @Roles('TRAINER', 'ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Req() req: Request, @Body() body: any) {
    return this.service.update(id, (req.user as any).id, body);
  }

  @Roles('TRAINER', 'ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: Request) {
    return this.service.delete(id, (req.user as any).id);
  }

  @Roles('TRAINER', 'ADMIN')
  @Post(':id/exercises')
  addExercise(@Param('id') id: string, @Req() req: Request, @Body() body: any) {
    return this.service.addExercise(id, (req.user as any).id, body);
  }

  @Roles('TRAINER', 'ADMIN')
  @Put(':id/exercises/:exerciseRowId')
  updateExercise(@Param('id') id: string, @Param('exerciseRowId') rowId: string, @Req() req: Request, @Body() body: any) {
    return this.service.updateExercise(id, rowId, (req.user as any).id, body);
  }

  @Roles('TRAINER', 'ADMIN')
  @Delete(':id/exercises/:exerciseRowId')
  removeExercise(@Param('id') id: string, @Param('exerciseRowId') rowId: string, @Req() req: Request) {
    return this.service.removeExercise(id, rowId, (req.user as any).id);
  }

  @Roles('TRAINER', 'ADMIN')
  @Post(':id/publish')
  publish(@Param('id') id: string, @Req() req: Request, @Body('changeNote') note?: string) {
    return this.service.publish(id, (req.user as any).id, note);
  }

  @Get(':id/versions')
  versions(@Param('id') id: string) { return this.service.listVersions(id); }
}