// test/movimientos.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Movimientos (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cuentaBaseId: number;
  let categoriaId: number;
  let movimientoCreadoId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get(PrismaService);
    await app.init();

    const cuentaBase = await prisma.cuenta.create({
      data: { nombre: 'Cuenta base E2E', saldoInicial: 1000 },
    });
    const categoria = await prisma.categoria.upsert({
      where: { nombre_tipo: { nombre: 'Categoria E2E', tipo: 'GASTO' } },
      update: {},
      create: { nombre: 'Categoria E2E', tipo: 'GASTO' },
    });
    cuentaBaseId = cuentaBase.cuentaId;
    categoriaId = categoria.categoriaId;

    const movimiento = await prisma.movimiento.create({
      data: {
        nombre: 'Compra E2E',
        monto: 50,
        tipo: 'GASTO',
        cuentaBaseId,
        categoriaId,
      },
    });
    movimientoCreadoId = movimiento.movimientoId;
  });

  afterAll(async () => {
    // Orden importante: movimientos primero (FK Restrict hacia cuenta y categoría)
    await prisma.movimiento.deleteMany({ where: { cuentaBaseId } });
    await prisma.cuenta.deleteMany({ where: { cuentaId: cuentaBaseId } });
    await prisma.categoria.deleteMany({ where: { categoriaId } });
    await app.close();
  });

  it('POST /movimientos falla con 400 si cuentaBaseId no existe', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        nombre: 'Gasto cuenta inexistente',
        monto: 10,
        tipo: 'GASTO',
        cuentaBaseId: 999999,
        categoriaId,
      })
      .expect(400);
  });

  it('PATCH /movimientos/:id falla con 400 si intenta cambiar el tipo', async () => {
    await request(app.getHttpServer())
      .patch(`/movimientos/${movimientoCreadoId}`)
      .send({ tipo: 'INGRESO' })
      .expect(400);
  });
});
