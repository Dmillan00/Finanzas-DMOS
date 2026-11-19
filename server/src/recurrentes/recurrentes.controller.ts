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

import { RecurrentesService } from './recurrentes.service.js';
import { CreateRecurrenteDto } from './dto/create-recurrente.dto.js';
import { UpdateRecurrenteDto } from './dto/update-recurrente.dto.js';

@Controller('recurrentes')
export class RecurrentesController {
  private readonly recurrentesService: RecurrentesService;

  constructor(recurrentesService: RecurrentesService) {
    this.recurrentesService = recurrentesService;
  }

  //Crear Recurrente
  @Post()
  async create(@Body() dto: CreateRecurrenteDto) {
    try {
      return await this.recurrentesService.create(dto);
    } catch (error) {
      console.error('Error al crear el recurrente', error);
      throw error;
    }
  }

  //Obtener todos los recurrentes
  @Get()
  async getAll() {
    try {
      return await this.recurrentesService.findAll();
    } catch (error) {
      console.error('Error al obtener los recurrentes:', error);
      throw error;
    }
  }

  // Obtener un recurrente
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.recurrentesService.findOne(id);
    } catch (error) {
      console.error('Error al obtener el recurrente:', error);
      throw error;
    }
  }

  //Actualizar recurrente
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecurrenteDto,
  ) {
    try {
      return await this.recurrentesService.update(id, dto);
    } catch (error) {
      console.error('Error al actualizar el recurrente:', error);
      throw error;
    }
  }

  //borrar recurrente
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.recurrentesService.delete(id);
    } catch (error) {
      console.error('Error al borrar el recurrente:', error);
      throw error;
    }
  }

  //Registrar pago de un recurrente
  @Post(':id/registrarPago')
  async registrarPago(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.recurrentesService.registrarPago(id);
    } catch (error) {
      console.error('Error al registrar el pago del recurrente:', error);
      throw error;
    }
  }
}
