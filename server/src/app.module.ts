import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CuentasModule } from './cuentas/cuentas.module.js';
import { MovimientosModule } from './movimientos/movimientos.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [CuentasModule, MovimientosModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
