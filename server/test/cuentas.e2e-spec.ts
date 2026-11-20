// test/cuentas.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Cuentas (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cuentaCreadaId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get(PrismaService);
    await app.init();

    const cuenta = await prisma.cuenta.create({
      data: { nombre: 'Cuenta E2E', saldoInicial: 500 },
    });
    cuentaCreadaId = cuenta.cuentaId;
  });

  afterAll(async () => {
    await prisma.cuenta.deleteMany({ where: { cuentaId: cuentaCreadaId } });
    await app.close();
  });

  it('POST /cuentas falla con 400 si falta nombre', async () => {
    await request(app.getHttpServer())
      .post('/cuentas')
      .send({ saldoInicial: 500 })
      .expect(400);
  });

  it('GET /cuentas/:id devuelve la cuenta con saldoActual', async () => {
    const res = await request(app.getHttpServer())
      .get(`/cuentas/${cuentaCreadaId}`)
      .expect(200);

    expect(res.body.cuentaId).toBe(cuentaCreadaId);
    expect(res.body.saldoActual).toBeDefined();
  });
});
