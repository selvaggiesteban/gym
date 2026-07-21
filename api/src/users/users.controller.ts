import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  @Roles('ADMIN')
  @Get()
  list(@Query('role') role?: string) { return this.service.listUsers(role); }

  @Roles('ADMIN')
  @Post('sync')
  sync() { return this.service.sync(); }

  @Roles('ADMIN')
  @Put(':id/role')
  setRole(@Param('id') id: string, @Body('role') role: 'ADMIN' | 'TRAINER' | 'MEMBER') {
    return this.service.setRole(id, role);
  }
}