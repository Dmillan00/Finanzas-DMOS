import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { TipoMovimientoCategoria } from '../generated/prisma/enums.js';

/**
 * CRUD de categorias bajo /categorias.
 * GET /categorias admite el filtro opcional ?tipo=GASTO|INGRESO.
 * */
@Controller('categorias')
export class CategoriasController {
  private readonly categoriasService: CategoriasService;

  constructor(categoriasService: CategoriasService) {
    this.categoriasService = categoriasService;
  }

  //Crear categoria
  @Post()
  async create(@Body() dto: CreateCategoriaDto) {
    return await this.categoriasService.create(dto);
  }

  //Mostrar todas las categorias
  @Get()
  async findAll(
    @Query(
      'tipo',
      new ParseEnumPipe(TipoMovimientoCategoria, { optional: true }),
    )
    tipo?: TipoMovimientoCategoria,
  ) {
    return await this.categoriasService.findAll(tipo);
  }

  //Mostrar una categoria
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriasService.findOne(id);
  }

  // Actualizar categoria. El tipo no se puede cambiar (400 si se envia).
  // 404 si no existe, 409 si el nombre ya esta en uso
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return await this.categoriasService.update(id, dto);
  }

  //Borrar categoria
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriasService.delete(id);
  }
}
