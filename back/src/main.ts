import { ValidationPipe } from '@nestjs/common';
import { NestFactory }    from '@nestjs/core';
import { AppModule }      from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // ← validation des DTOs : whitelist, et forbiddenNonWhitelisted lèvera un 400 si propriété inattendue
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Backend démarré sur http://localhost:${port}`);
}
bootstrap();
