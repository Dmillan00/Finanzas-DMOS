import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCuentaDto } from './dto/create-cuenta.dto.js';
import { UpdateCuentaDto } from './dto/update-cuenta.dto.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class CuentasService {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  //Crear cuenta
  async createCuenta(data: CreateCuentaDto) {
    return this.prisma.cuenta.create({ data });
  }

  //Obtener todas las cuentas
  async getCuentas() {
    return this.prisma.cuenta.findMany();
  }

  //Obtener cuenta por id
  async getCuentaById(id: number) {
    const cuenta = await this.prisma.cuenta.findUnique({
      where: { cuentaId: id },
    });
    if (!cuenta) {
      throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
    }
    return cuenta;
  }

  //Actualizar cuenta

  async updateCuenta(id: number, data: UpdateCuentaDto) {
    try {
      return await this.prisma.cuenta.update({
        where: { cuentaId: id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  //Eliminar cuenta

  async deleteCuenta(id: number) {
    try {
      return await this.prisma.cuenta.delete({
        where: { cuentaId: id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Cuenta con ID ${id} no encontrada`);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException(
          `No se puede eliminar la cuenta porque está relacionada con otra entidad`,
        );
      }
      throw error;
    }
  }
}
