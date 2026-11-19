import { Module } from '@nestjs/common';
import { RecurrentesService } from './recurrentes.service.js';
import { RecurrentesController } from './recurrentes.controller.js';

@Module({
  providers: [RecurrentesService],
  controllers: [RecurrentesController]
})
export class RecurrentesModule {}
