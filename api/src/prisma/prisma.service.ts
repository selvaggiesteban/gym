import { Global, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '../../prisma/generated/client';

@Global()
@Injectable()
export class PrismaService {
  private readonly logger = new Logger(PrismaService.name);
  readonly client: PrismaClient;

  constructor() {
    // In Workers: D1 binding is injected via env
    // In local dev: use libsql with local SQLite file
    const db = (globalThis as any).__D1_DATABASE__;
    if (db) {
      const { PrismaD1 } = require('@prisma/adapter-d1');
      const adapter = new PrismaD1(db);
      this.client = new PrismaClient({ adapter } as any);
      this.logger.log('Using D1 adapter');
    } else {
      try {
        const { PrismaLibSql } = require('@prisma/adapter-libsql');
        const { createClient } = require('@libsql/client');
        const libsql = createClient({ url: 'file:./prisma/dev.db' });
        const adapter = new PrismaLibSql(libsql);
        this.client = new PrismaClient({ adapter } as any);
        this.logger.log('Using libsql adapter (local SQLite)');
      } catch {
        this.client = new PrismaClient({} as any);
        this.logger.warn('No adapter found, using default PrismaClient');
      }
    }
  }

  async onModuleInit() {
    await this.client.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    this.logger.log('Prisma disconnected');
  }

  async resolveTrainerId(profileId: string): Promise<string> {
    const trainer = await this.client.trainer.findUnique({ where: { profileId } });
    if (!trainer) throw new Error('Perfil no es entrenador');
    return trainer.id;
  }
}
