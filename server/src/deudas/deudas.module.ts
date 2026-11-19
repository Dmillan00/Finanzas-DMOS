import { Module } from '@nestjs/common';
import { DeudasService } from './deudas.service.js';
import { DeudasController } from './deudas.controller.js';

@Module({
  providers: [DeudasService],
  controllers: [DeudasController],
})
export class DeudasModule {}
