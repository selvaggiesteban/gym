import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [MembersController],
  providers: [MembersService, JwtAuthGuard, RolesGuard],
  exports: [MembersService],
})
export class MembersModule {}