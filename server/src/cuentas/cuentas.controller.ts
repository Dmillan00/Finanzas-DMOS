import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CuentasService } from './cuentas.service.js';
import { CreateCuentaDto } from './dto/create-cuenta.dto.js';
import { UpdateCuentaDto } from './dto/update-cuenta.dto.js';

@Controller('cuentas')
export class CuentasController {
  private readonly cuentasService: CuentasService;

  constructor(cuentasService: CuentasService) {
    this.cuentasService = cuentasService;
  }

  //Crear cuenta
  @Post()
  create(@Body() dto: CreateCuentaDto) {
    return this.cuentasService.create(dto);
  }

  //Mostrar todas las cuentas
  @Get()
  findAll() {
    return this.cuentasService.findAll();
  }

  //Mostrar una cuenta con su saldo
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cuentasService.getBalance(id);
  }

  //Actualizar cuenta
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCuentaDto) {
    return this.cuentasService.update(id, dto);
  }

  //Borrar cuenta
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.cuentasService.delete(id);
  }
}
