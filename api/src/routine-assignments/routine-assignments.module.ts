import { Module } from '@nestjs/common';
import { RoutineAssignmentsService } from './routine-assignments.service';
import { RoutineAssignmentsController } from './routine-assignments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [RoutineAssignmentsController],
  providers: [RoutineAssignmentsService, JwtAuthGuard, RolesGuard],
  exports: [RoutineAssignmentsService],
})
export class RoutineAssignmentsModule {}