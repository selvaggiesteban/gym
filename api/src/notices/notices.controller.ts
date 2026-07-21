import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { NoticesService } from './notices.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('notices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoticesController {
  constructor(private service: NoticesService) {}

  @Get()
  list() { return this.service.list(); }

  @Roles('ADMIN')
  @Post()
  create(@Body() body: { title: string; message: string }) { return this.service.create(body); }

  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }
}