import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRecurrenteDto } from './dto/create-recurrente.dto.js';
import { UpdateRecurrenteDto } from './dto/update-recurrente.dto.js';
import {
  Categoria,
  Periodicidad,
  Prisma,
  TipoMovimientoCategoria,
} from '../generated/prisma/client.js';

@Injectable()
export class RecurrentesService {
  private readonly prisma: PrismaService;

  private validarReglas(
    tipo: TipoMovimientoCategoria,
    categoria: Categoria,
    deudaId: number | null,
  ) {
    if (categoria.tipo !== tipo) {
      throw new BadRequestException(`El tipo de la categoría no coincide`);
    }

    if (deudaId != null && tipo !== TipoMovimientoCategoria.GASTO) {
      throw new BadRequestException(`Una deuda solo se paga con un GASTO`);
    }
  }

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  //Crear Recurrente

  async create(data: CreateRecurrenteDto) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { categoriaId: data.categoriaId },
    });
    if (!categoria) {
      throw new BadRequestException(
        `La categoria con ID ${data.categoriaId} no existe`,
      );
    }

    this.validarReglas(data.tipo, categoria, data.deudaId ?? null);

    const proximaFechaDate = new Date(data.proximaFecha);

    const datosPrisma = { ...data, proximaFecha: proximaFechaDate };

    try {
      return await this.prisma.recurrente.create({
        data: datosPrisma,
        include: { categoria: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          `No se puede crear el recurrente porque la cuenta o la deuda no existe`,
        );
      }
      throw error;
    }
  }

  //Obtener todos los recurrentes
  async findAll() {
    return this.prisma.recurrente.findMany({
      orderBy: [{ proximaFecha: 'asc' }, { recurrenteId: 'desc' }],
      include: { categoria: true },
    });
  }

  //Obtener movimiento por id
  async findOne(id: number) {
    const recurrente = await this.prisma.recurrente.findUnique({
      where: { recurrenteId: id },
      include: { categoria: true },
    });

    if (!recurrente) {
      throw new NotFoundException(
        `El recurrente con ID ${id} no fue encontrado`,
      );
    }
    return recurrente;
  }

  //Actualizar Recurrente

  async update(id: number, data: UpdateRecurrenteDto) {
    const existente = await this.prisma.recurrente.findUnique({
      where: { recurrenteId: id },
    });

    if (!existente) {
      throw new NotFoundException(
        `El recurrente con ID ${id} no fue encontrado`,
      );
    }

    const categoriaId = data.categoriaId ?? existente.categoriaId;

    const deudaId =
      data.deudaId !== undefined ? data.deudaId : existente.deudaId;

    const categoria = await this.prisma.categoria.findUnique({
      where: { categoriaId },
    });

    if (!categoria) {
      throw new BadRequestException(
        `La categoria con ID ${categoriaId} no existe`,
      );
    }

    this.validarReglas(existente.tipo, categoria, deudaId);

    const fechaDate = data.proximaFecha
      ? new Date(data.proximaFecha)
      : undefined;

    const datosPrisma = { ...data, proximaFecha: fechaDate };

    try {
      return await this.prisma.recurrente.update({
        where: { recurrenteId: id },
        data: datosPrisma,
        include: { categoria: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `El recurrente con ID ${id} no fue encontrado`,
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          `No se puede actualizar el recurrente porque la cuenta o la deuda no existe`,
        );
      }
      throw error;
    }
  }

  //Borrar recurrente

  async delete(id: number) {
    try {
      return await this.prisma.recurrente.delete({
        where: { recurrenteId: id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `El recurrente con ID ${id} no fue encontrado`,
        );
      }
      throw error;
    }
  }

  private avanzarFecha(fecha: Date, periodicidad: Periodicidad): Date {
    let year = fecha.getUTCFullYear();
    let month = fecha.getUTCMonth();
    let day = fecha.getUTCDate();

    if (periodicidad === Periodicidad.MENSUAL) {
      month += 1;
    }

    if (periodicidad === Periodicidad.ANUAL) {
      year += 1;
    }

    const ultimoDia = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    day = Math.min(day, ultimoDia);

    return new Date(Date.UTC(year, month, day));
  }

  //Registrar pago de un recurrente
  async registrarPago(id: number) {
    const recurrente = await this.findOne(id);

    const [movimiento, actualizado] = await this.prisma.$transaction([
      this.prisma.movimiento.create({
        data: {
          nombre: recurrente.nombre,
          monto: recurrente.monto,
          tipo: recurrente.tipo,
          cuentaBaseId: recurrente.cuentaId,
          categoriaId: recurrente.categoriaId,
          deudaId: recurrente.deudaId,
        },
        include: { categoria: true },
      }),
      this.prisma.recurrente.update({
        where: { recurrenteId: id },
        data: {
          proximaFecha: this.avanzarFecha(
            recurrente.proximaFecha,
            recurrente.periodicidad,
          ),
        },
        include: { categoria: true },
      }),
    ]);

    return { movimiento, recurrente: actualizado };
  }
}
