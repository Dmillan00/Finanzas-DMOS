import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class CategoriasService {
  private readonly prisma: PrismaService;

  private normalizarNombre(nombre: string) {
    const limpio = nombre.trim().replace(/\s+/g, ' ');

    if (!limpio) {
      throw new BadRequestException('El nombre no puede estar vacio');
    }

    return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
  }

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async createCategoria(data: CreateCategoriaDto) {
    const nombreLimpio = this.normalizarNombre(data.nombre);

    try {
      return await this.prisma.categoria.create({
        data: {
          ...data,
          nombre: nombreLimpio,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `No puede haber dos categorias con el mismo nombre`,
        );
      }
      throw error;
    }
  }

  async getCategorias() {
    return await this.prisma.categoria.findMany();
  }

  async getCategoria(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { categoriaId: id },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
    }
    return categoria;
  }

  async updateCategoria(id: number, data: UpdateCategoriaDto) {
    if (data.nombre === null) {
      throw new BadRequestException('El nombre no puede ser null');
    }

    const datosFinales: Prisma.CategoriaUpdateInput =
      data.nombre !== undefined
        ? { ...data, nombre: this.normalizarNombre(data.nombre) }
        : data;

    try {
      return await this.prisma.categoria.update({
        where: { categoriaId: id },
        data: datosFinales,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `No puede haber dos categorias con el mismo nombre`,
        );
      }
      throw error;
    }
  }

  async deleteCategoria(id: number) {
    try {
      return await this.prisma.categoria.delete({
        where: { categoriaId: id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          `No se puede eliminar la categoria porque está relacionada con otra entidad`,
        );
      }
      throw error;
    }
  }
}
