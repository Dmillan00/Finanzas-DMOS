import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMovimientoDto } from './dto/create-movimiento.dto.js';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto.js';
import { Prisma, TipoMovimiento } from '../generated/prisma/client.js';

@Injectable()
export class MovimientosService {
  private readonly prisma: PrismaService;

  private validarReglas(
    tipo: TipoMovimiento,
    base: number,
    destino: number | null,
  ) {
    if (tipo === TipoMovimiento.TRANSFERENCIA && destino == null) {
      throw new BadRequestException(
        `No se puede actuar sobre el movimiento de tipo TRANSFERENCIA sin una cuenta destino`,
      );
    }

    if (tipo !== TipoMovimiento.TRANSFERENCIA && destino != null) {
      throw new BadRequestException(
        `No se puede actuar sobre el movimiento de tipo ${tipo} con una cuenta destino`,
      );
    }
    if (tipo === TipoMovimiento.TRANSFERENCIA && base === destino) {
      throw new BadRequestException(
        `No se puede actuar sobre el movimiento de tipo TRANSFERENCIA con la misma cuenta base y cuenta destino`,
      );
    }
  }

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  //Crear Movimiento

  async createMovimiento(data: CreateMovimientoDto) {
    this.validarReglas(
      data.tipo,
      data.cuentaBaseId,
      data.cuentaDestinoId ?? null,
    );
    try {
      return await this.prisma.movimiento.create({ data });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          `No se puede crear el movimiento porque la cuenta base o la cuenta destino no existe`,
        );
      }
      throw error;
    }
  }

  //Obtener todos los movimientos
  async getMovimientos() {
    return this.prisma.movimiento.findMany();
  }

  //Obtener movimiento por id
  async getMovimientoById(id: number) {
    const movimiento = await this.prisma.movimiento.findUnique({
      where: { movimientoId: id },
    });

    if (!movimiento) {
      throw new NotFoundException(
        `El movimiento con ID ${id} no fue encontrado`,
      );
    }
    return movimiento;
  }

  //Actualizar movimiento

  async updateMovimiento(id: number, data: UpdateMovimientoDto) {
    const movimientoExistente = await this.prisma.movimiento.findUnique({
      where: { movimientoId: id },
    });

    if (!movimientoExistente) {
      throw new NotFoundException(
        `El movimiento con ID ${id} no fue encontrado`,
      );
    }

    const destino =
      data.cuentaDestinoId !== undefined
        ? data.cuentaDestinoId
        : movimientoExistente.cuentaDestinoId;

    const base = data.cuentaBaseId ?? movimientoExistente.cuentaBaseId;
    if (data.tipo != undefined && data.tipo !== movimientoExistente.tipo) {
      throw new BadRequestException(
        `No se puede cambiar el tipo de movimiento de ${movimientoExistente.tipo} a ${data.tipo}`,
      );
    }
    this.validarReglas(movimientoExistente.tipo, base, destino);

    try {
      return await this.prisma.movimiento.update({
        where: { movimientoId: id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `El movimiento con ID ${id} no fue encontrado`,
        );
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          `No se puede actualizar el movimiento porque la cuenta base o la cuenta destino no existe`,
        );
      }
      throw error;
    }
  }

  //Borrar movimiento

  async deleteMovimiento(id: number) {
    try {
      return await this.prisma.movimiento.delete({
        where: { movimientoId: id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          `El movimiento con ID ${id} no fue encontrado`,
        );
      }
      throw error;
    }
  }
}
