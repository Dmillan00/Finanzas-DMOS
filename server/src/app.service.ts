import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  // Metodo para obtener la base de datos actual, Devuelve {bd: nombre}
  async getService() {
    const filas = await this.prisma.$queryRaw<
      { current_database: string }[]
    >`SELECT current_database()`;
    return { bd: filas[0].current_database };
  }
}
