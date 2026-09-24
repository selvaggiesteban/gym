import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 — Cloudflare D1 (SQLite)
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },
});
