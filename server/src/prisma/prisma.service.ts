import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const connectionURL = process.env.DATABASE_URL;

    if (!connectionURL) {
      throw new Error('La variable de entorno DATABASE_URL no esta definida');
    }

    const adapter = new PrismaPg({
      connectionString: connectionURL,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
