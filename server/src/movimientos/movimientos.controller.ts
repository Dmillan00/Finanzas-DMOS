import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { MovimientosService } from './movimientos.service.js';
import { CreateMovimientoDto } from './dto/create-movimiento.dto.js';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto.js';

@Controller('movimientos')
export class MovimientosController {
  private readonly movimientosService: MovimientosService;

  constructor(movimientosService: MovimientosService) {
    this.movimientosService = movimientosService;
  }

  //Crear Movimiento
  @Post()
  async createMovimiento(@Body() dto: CreateMovimientoDto) {
    try {
      return await this.movimientosService.createMovimiento(dto);
    } catch (error) {
      console.error('Error al crear el movimiento', error);
      throw error;
    }
  }

  //Obtener todos los movimientos
  @Get()
  async getMovimientos(
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
  ) {
    try {
      return await this.movimientosService.getMovimientos(year, month);
    } catch (error) {
      console.error('Error al obtener los movimientos:', error);
      throw error;
    }
  }

  // Obtener un movimiento
  @Get(':id')
  async getMovimiento(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.movimientosService.getMovimientoById(id);
    } catch (error) {
      console.error('Error al obtener el movimiento:', error);
      throw error;
    }
  }

  //Actualizar movimiento
  @Patch(':id')
  async updateMovimiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMovimientoDto,
  ) {
    try {
      return await this.movimientosService.updateMovimiento(id, dto);
    } catch (error) {
      console.error('Error al actualizar el movimiento:', error);
      throw error;
    }
  }

  //borrar movimiento
  @Delete(':id')
  async deleteMovimiento(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.movimientosService.deleteMovimiento(id);
    } catch (error) {
      console.error('Error al borrar el movimiento:', error);
      throw error;
    }
  }
}
