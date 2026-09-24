import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { CloudflareAdapter } from '@mridang/nestjs-platform-cloudflare';
import { AppModule } from './app.module';

const adapter = new CloudflareAdapter();
const app = await NestFactory.create(AppModule, adapter, { logger: ['error', 'warn', 'log'] });
app.setGlobalPrefix('api');
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
  }),
);

app.enableCors({
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGIN || '').split(',').map(o => o.trim());
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

await app.init();

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> =>
    adapter.handle(request, env, ctx),
};

interface Env {
  DB: D1Database;
  CORS_ORIGIN: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
}
