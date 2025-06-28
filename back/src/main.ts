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

  
  const allowedOriginEnv = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
  const allowedOrigins = [
    'http://localhost:3000',
    'http://172.20.10.2:3000',
    'http://192.168.1.75:3000',
    ...allowedOriginEnv.split(',').map(o => o.trim())
  ];
  
  app.enableCors({
    origin: allowedOrigins,
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
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend démarré sur http://localhost:${port}`);
}
bootstrap();
