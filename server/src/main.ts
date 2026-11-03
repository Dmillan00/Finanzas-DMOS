import 'dotenv/config.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const corsEnvironment = process.env.CORS_ORIGIN;
  const diaCobro = Number(process.env.DIA_COBRO);

  if (!diaCobro) {
    throw new Error('DIA_COBRO no esta definido');
  } else if (!Number.isInteger(diaCobro)) {
    throw new Error('El dia de cobro debe ser un entero');
  } else if (diaCobro < 1 || diaCobro > 28) {
    throw new Error('El dia de cobro debe estar entre el 1 y 28 del mes');
  }
  if (!corsEnvironment) {
    throw new Error('CORS_ORIGIN no esta definido en el archivo .env');
  }
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: corsEnvironment,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
