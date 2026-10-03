import { Module } from '@nestjs/common';
import { CuentasService } from './cuentas.service.js';
import { CuentasController } from './cuentas.controller.js';

@Module({
  providers: [CuentasService],
  controllers: [CuentasController],
})
export class CuentasModule {}
