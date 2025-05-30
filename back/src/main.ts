// back/src/main.ts
import 'reflect-metadata';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // --- CORS pour frontend React (localhost:3000) ---
  app.enableCors({
    origin: 'http://localhost:3000',  // FRONT local
    credentials: true,                // Autorise cookies/headers auth
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // --- Exposition du dossier uploads en statique ---
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Backend démarré sur http://localhost:${port}`);
}
bootstrap();
