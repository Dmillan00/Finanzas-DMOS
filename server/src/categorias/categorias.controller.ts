import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';

@Controller('categorias')
export class CategoriasController {
  private readonly categoriasService: CategoriasService;

  constructor(categoriasService: CategoriasService) {
    this.categoriasService = categoriasService;
  }

  // Crear categoria
  @Post()
  async createCategoria(@Body() dto: CreateCategoriaDto) {
    try {
      return await this.categoriasService.createCategoria(dto);
    } catch (error) {
      console.error('Error al crear la categoria:', error);
      throw error;
    }
  }

  //Obtener Categorias

  @Get()
  getCategorias() {
    try {
      return this.categoriasService.getCategorias();
    } catch (error) {
      console.error('Error al obtener las categorias:', error);
      throw error;
    }
  }
  //Obtener una categoria

  @Get(':id')
  async getCategoria(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.categoriasService.getCategoria(id);
    } catch (error) {
      console.error('Error al obtener la categoria:', error);
      throw error;
    }
  }

  @Patch(':id')
  async updateCategoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    try {
      return await this.categoriasService.updateCategoria(id, dto);
    } catch (error) {
      console.error('Error al actualizar la categoria', error);
      throw error;
    }
  }

  @Delete(':id')
  deleteCategoria(@Param('id', ParseIntPipe) id: number) {
    try {
      return this.categoriasService.deleteCategoria(id);
    } catch (error) {
      console.error('Error al borrar la categoria', error);
      throw error;
    }
  }
}
