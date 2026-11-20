import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Devuelve la BD (main/dev) a la que esta conectado el server
  @Get('sistema')
  getSistema() {
    return this.appService.getService();
  }
}
