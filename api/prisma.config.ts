import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 ya no accepta `url` en el datasource del schema.
// Ver: https://pris.ly/d/config-datasource
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
