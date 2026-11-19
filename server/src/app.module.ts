import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { CuentasModule } from './cuentas/cuentas.module.js';
import { MovimientosModule } from './movimientos/movimientos.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CategoriasModule } from './categorias/categorias.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { RecurrentesModule } from './recurrentes/recurrentes.module.js';
import { DeudasModule } from './deudas/deudas.module.js';

@Module({
  imports: [
    CuentasModule,
    MovimientosModule,
    PrismaModule,
    CategoriasModule,
    DashboardModule,
    RecurrentesModule,
    DeudasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
