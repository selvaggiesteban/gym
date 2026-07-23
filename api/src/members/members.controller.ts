import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { MembersService, CreateMemberInput } from './members.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private service: MembersService) {}

  @Roles('ADMIN', 'TRAINER')
  @Get()
  list() { return this.service.list(); }

  @Get('me')
  me(@Req() req: Request) {
    const user = req.user as any;
    return this.service.get(user.id);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() input: CreateMemberInput) { return this.service.create(input); }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Roles('ADMIN')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Roles('ADMIN')
  @Delete(':id')
  archive(@Param('id') id: string) { return this.service.archive(id); }
}