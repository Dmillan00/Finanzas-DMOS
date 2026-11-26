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
  async create(@Body() dto: CreateCuentaDto) {
    try {
      return await this.cuentasService.create(dto);
    } catch (error) {
      console.error('Error al crear la cuenta:', error);
      throw error;
    }
  }

  //Mostrar todas las cuentas

  @Get()
  async findAll() {
    try {
      return await this.cuentasService.findAll();
    } catch (error) {
      console.error('Error al obtener las cuentas:', error);
      throw error;
    }
  }

  //mostrar Una cuenta

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.cuentasService.getBalance(id);
    } catch (error) {
      console.error('Error al obtener la cuenta:', error);
      throw error;
    }
  }

  //Actualizar cuenta

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCuentaDto,
  ) {
    try {
      return await this.cuentasService.update(id, dto);
    } catch (error) {
      console.error('Error al actualizar la cuenta', error);
      throw error;
    }
  }

  //Borrar cuenta

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.cuentasService.delete(id);
    } catch (error) {
      console.error('Error al borrar la cuenta', error);
      throw error;
    }
  }
}
