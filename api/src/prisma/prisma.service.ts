import { Global, Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/client';

@Global()
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  readonly client = new PrismaClient({} as any);

  async onModuleInit() {
    await this.client.$connect();
    this.logger.log('Prisma connected to MySQL');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    this.logger.log('Prisma disconnected from MySQL');
  }
}
