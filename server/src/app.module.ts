import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CuentasModule } from './cuentas/cuentas.module.js';
import { MovimientosModule } from './movimientos/movimientos.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';

@Module({
  imports: [CuentasModule, MovimientosModule, PrismaModule, CategoriasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
