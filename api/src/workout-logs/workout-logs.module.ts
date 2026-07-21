import { Module } from '@nestjs/common';
import { WorkoutLogsService } from './workout-logs.service';
import { WorkoutLogsController } from './workout-logs.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [WorkoutLogsController],
  providers: [WorkoutLogsService, JwtAuthGuard, RolesGuard],
})
export class WorkoutLogsModule {}