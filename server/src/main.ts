import 'dotenv/config.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const corsEnvironment = process.env.CORS_ORIGIN;
  if (!corsEnvironment) {
    throw new Error('CORS_ORIGIN no esta definido en el archivo .env');
  }
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: corsEnvironment,
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
