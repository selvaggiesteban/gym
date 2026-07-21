import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MembersModule } from './members/members.module';
import { PaymentsModule } from './payments/payments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ScheduleModule } from './schedule/schedule.module';
import { NoticesModule } from './notices/notices.module';
import { RoutinesModule } from './routines/routines.module';
import { RoutineAssignmentsModule } from './routine-assignments/routine-assignments.module';
import { WorkoutLogsModule } from './workout-logs/workout-logs.module';
import { ExercisesCatalogModule } from './exercises-catalog/exercises-catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    MembersModule,
    PaymentsModule,
    AttendanceModule,
    ScheduleModule,
    NoticesModule,
    RoutinesModule,
    RoutineAssignmentsModule,
    WorkoutLogsModule,
    ExercisesCatalogModule,
  ],
})
export class AppModule {}
