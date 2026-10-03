import { Global, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    const urlExists = process.env.DATABASE_URL;
    if (!urlExists) {
      throw new Error('La variable de entorno DATABASE_URL no esta definida');
    }
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
