import { Module } from '@nestjs/common';
import { MovimientosService } from './movimientos.service.js';
import { MovimientosController } from './movimientos.controller.js';

@Module({
  providers: [MovimientosService],
  controllers: [MovimientosController],
})
export class MovimientosModule {}
