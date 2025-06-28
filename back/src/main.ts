// back/src/main.ts

import 'reflect-metadata';
import { ValidationPipe, Logger }   from '@nestjs/common';
import { NestFactory }              from '@nestjs/core';
import { AppModule }                from './app.module';
import { join }                     from 'path';
import { NestExpressApplication }   from '@nestjs/platform-express';
import * as express                 from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // CORS pour React
    const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
  });

  // Validation globale (JSON) – par défaut on garde forbidNonWhitelisted: true
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false, // Temporarily set to false for debugging
      transform: true,
    }),
  );

  // Sert le dossier public/ à la racine
  app.use('/', express.static(join(__dirname, '..', 'public')));
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public/' });
  // Sert le dossier uploads/ à la racine
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Backend démarré sur http://localhost:${port}`);
}
bootstrap();
