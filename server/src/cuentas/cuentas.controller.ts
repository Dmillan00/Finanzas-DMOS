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
  async createCuenta(@Body() dto: CreateCuentaDto) {
    try {
      return await this.cuentasService.createCuenta(dto);
    } catch (error) {
      console.error('Error al crear la cuenta:', error);
      throw error;
    }
  }

  //Obtener todas las cuentas

  @Get()
  async getCuentas() {
    try {
      return await this.cuentasService.getCuentas();
    } catch (error) {
      console.error('Error al obtener las cuentas:', error);
      throw error;
    }
  }

  //Obtener Una cuenta

  @Get(':id')
  async getCuenta(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.cuentasService.calcularSaldoTotal(id);
    } catch (error) {
      console.error('Error al obtener la cuenta:', error);
      throw error;
    }
  }

  //Actualizar cuenta

  @Patch(':id')
  async updateCuenta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCuentaDto,
  ) {
    try {
      return await this.cuentasService.updateCuenta(id, dto);
    } catch (error) {
      console.error('Error al actualizar la cuenta', error);
      throw error;
    }
  }

  //Borrar cuenta

  @Delete(':id')
  async deleteCuenta(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.cuentasService.deleteCuenta(id);
    } catch (error) {
      console.error('Error al borrar la cuenta', error);
      throw error;
    }
  }
}
