import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoriaDto } from './dto/create-categoria.dto.js';
import { UpdateCategoriaDto } from './dto/update-categoria.dto.js';
import { Prisma, TipoMovimientoCategoria } from '../generated/prisma/client.js';

@Injectable()
export class CategoriasService {
  private readonly prisma: PrismaService;

  // Metodo para normalizar el nombre, devuelve el mismo nombre sin espacios y con Capitalize
  private normalizeName(nombre: string) {
    const cleanName = nombre.trim().replace(/\s+/g, ' ');

    if (!cleanName) {
      throw new BadRequestException('El nombre no puede estar vacio');
    }

    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  }

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  // Crear Categoria
  async create(data: CreateCategoriaDto) {
    const name = this.normalizeName(data.nombre);

    if (data.limite !== undefined && data.limite !== null) {
      if (data.tipo === TipoMovimientoCategoria.INGRESO) {
        throw new BadRequestException(
          `Solo las categorías de gasto pueden tener límite`,
        );
      }
    }

    try {
      return await this.prisma.categoria.create({
        data: {
          ...data,
          nombre: name,
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

  //Mostrar todas las categorias
  async findAll(type?: TipoMovimientoCategoria) {
    return await this.prisma.categoria.findMany({
      where: {
        tipo: type,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  //Mostrar una categoria
  async findOne(id: number) {
    const category = await this.prisma.categoria.findUnique({
      where: { categoriaId: id },
    });

    if (!category) {
      throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
    }
    return category;
  }

  //Actualizar categoria
  async update(id: number, data: UpdateCategoriaDto) {
    if (data.nombre === null) {
      throw new BadRequestException('El nombre no puede ser null');
    }

    if (data.limite !== undefined && data.limite !== null) {
      const category = await this.findOne(id);
      if (category.tipo === TipoMovimientoCategoria.INGRESO) {
        throw new BadRequestException(
          'Solo las categorías de gasto pueden tener límite',
        );
      }
    }

    // objeto Data con la informacion saneada para mandar a update
    const normalizeData: Prisma.CategoriaUpdateInput =
      data.nombre !== undefined
        ? { ...data, nombre: this.normalizeName(data.nombre) }
        : data;

    try {
      return await this.prisma.categoria.update({
        where: { categoriaId: id },
        data: normalizeData,
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

  //borrar categoria
  async delete(id: number) {
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
