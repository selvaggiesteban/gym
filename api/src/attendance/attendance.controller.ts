import { Controller, Get, Post, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

// Ruta publica de check-in (/api/attendance/check-in)
@Controller('attendance')
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Post('check-in')
  checkIn(@Body('memberCode') code: string) { return this.service.checkInByCode(code); }

  @Get()
  list() { return this.service.list(); }

  @Get('failed')
  failed() { return this.service.failedAttempts(); }

  @Get('overview')
  overview() { return this.service.overview(); }
}