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
import { DeudasService } from './deudas.service.js';
import { CreateDeudaDto } from './dto/create-deuda.dto.js';
import { UpdateDeudaDto } from './dto/update-deuda.dto.js';

@Controller('deudas')
export class DeudasController {
  private readonly deudasService: DeudasService;

  constructor(deudasService: DeudasService) {
    this.deudasService = deudasService;
  }

  //Crear deuda
  @Post()
  async create(@Body() dto: CreateDeudaDto) {
    try {
      return await this.deudasService.create(dto);
    } catch (error) {
      console.error('Error al crear la deuda:', error);
      throw error;
    }
  }

  //Obtener todas las deudas
  @Get()
  async getAll() {
    try {
      return await this.deudasService.findAll();
    } catch (error) {
      console.error('Error al obtener las deudas:', error);
      throw error;
    }
  }

  //Obtener una deuda
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.deudasService.findOne(id);
    } catch (error) {
      console.error('Error al obtener la deuda:', error);
      throw error;
    }
  }

  //Actualizar deuda
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDeudaDto,
  ) {
    try {
      return await this.deudasService.update(id, dto);
    } catch (error) {
      console.error('Error al actualizar la deuda:', error);
      throw error;
    }
  }

  //Borrar deuda
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.deudasService.delete(id);
    } catch (error) {
      console.error('Error al borrar la deuda:', error);
      throw error;
    }
  }
}
