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
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Validation globale (JSON) – par défaut on garde forbidNonWhitelisted: true
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Sert le dossier public/ à la racine
  app.use('/', express.static(join(__dirname, '..', 'public')));
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public/' });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Backend démarré sur http://localhost:${port}`);
}
bootstrap();
