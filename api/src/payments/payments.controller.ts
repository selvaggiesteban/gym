import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PaymentsService, PLANS } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Get()
  list() { return this.service.list(); }

  @Get('plans')
  plans() { return PLANS; }

  @Roles('ADMIN')
  @Post()
  create(@Body() body: { memberId: string; plan: string; amount?: number }) {
    return this.service.create(body.memberId, body.plan, body.amount);
  }

  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) { return this.service.delete(id); }

  @Get('monthly')
  monthly(@Query('year') y: string, @Query('month') m: string) {
    return this.service.monthly(Number(y), Number(m));
  }
}