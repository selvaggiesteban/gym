import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtRefreshGuard],
  exports: [JwtAuthGuard, JwtRefreshGuard, AuthService],
})
export class AuthModule {}
