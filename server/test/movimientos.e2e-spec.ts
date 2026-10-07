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
  let cuentaDestinoId: number;
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
    const cuentaDestino = await prisma.cuenta.create({
      data: { nombre: 'Cuenta destino E2E', saldoInicial: 0 },
    });
    // upsert: si una ejecución anterior falló y dejó la categoría, no rompe por el unique
    const categoria = await prisma.categoria.upsert({
      where: { nombre: 'Categoria Mov E2E' },
      update: {},
      create: { nombre: 'Categoria Mov E2E' },
    });
    cuentaBaseId = cuentaBase.cuentaId;
    cuentaDestinoId = cuentaDestino.cuentaId;
    categoriaId = categoria.categoriaId;
  });

  afterAll(async () => {
    // Orden importante: movimientos primero (FK Restrict hacia cuenta y categoría)
    await prisma.movimiento.deleteMany({
      where: { OR: [{ cuentaBaseId }, { cuentaDestinoId }] },
    });
    await prisma.cuenta.deleteMany({
      where: { cuentaId: { in: [cuentaBaseId, cuentaDestinoId] } },
    });
    await prisma.categoria.deleteMany({ where: { categoriaId } });
    await app.close();
  });

  it('POST /movimientos crea un GASTO con categoría', async () => {
    const res = await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        nombre: 'Compra E2E',
        monto: 50,
        tipo: 'GASTO',
        cuentaBaseId,
        categoriaId,
      })
      .expect(201);

    expect(res.body.tipo).toBe('GASTO');
    expect(res.body.categoria.categoriaId).toBe(categoriaId);
    movimientoCreadoId = res.body.movimientoId;
  });

  it('POST /movimientos crea una TRANSFERENCIA sin categoría', async () => {
    const res = await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        nombre: 'Transfer E2E',
        monto: 10,
        tipo: 'TRANSFERENCIA',
        cuentaBaseId,
        cuentaDestinoId,
      })
      .expect(201);

    expect(res.body.categoria).toBeNull();
  });

  it('POST /movimientos falla con 400 si GASTO sin categoría', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        nombre: 'Gasto sin categoría',
        monto: 10,
        tipo: 'GASTO',
        cuentaBaseId,
      })
      .expect(400);
  });

  it('POST /movimientos falla con 400 si TRANSFERENCIA lleva categoría', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        nombre: 'Transfer con categoría',
        monto: 10,
        tipo: 'TRANSFERENCIA',
        cuentaBaseId,
        cuentaDestinoId,
        categoriaId,
      })
      .expect(400);
  });

  it('POST /movimientos falla con 400 si TRANSFERENCIA sin cuentaDestinoId', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        nombre: 'Transfer inválida',
        monto: 10,
        tipo: 'TRANSFERENCIA',
        cuentaBaseId,
      })
      .expect(400);
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

  it('POST /movimientos falla con 400 si categoriaId no existe', async () => {
    await request(app.getHttpServer())
      .post('/movimientos')
      .send({
        nombre: 'Gasto categoría inexistente',
        monto: 10,
        tipo: 'GASTO',
        cuentaBaseId,
        categoriaId: 999999,
      })
      .expect(400);
  });

  it('GET /movimientos devuelve el movimiento creado', async () => {
    const res = await request(app.getHttpServer())
      .get('/movimientos')
      .expect(200);

    expect(
      res.body.some(
        (m: { movimientoId: number }) => m.movimientoId === movimientoCreadoId,
      ),
    ).toBe(true);
  });

  it('GET /movimientos?month=10 sin year devuelve 400', async () => {
    await request(app.getHttpServer()).get('/movimientos?month=10').expect(400);
  });

  it('GET /movimientos?year=2026&month=13 devuelve 400', async () => {
    await request(app.getHttpServer())
      .get('/movimientos?year=2026&month=13')
      .expect(400);
  });

  it('PATCH /movimientos/:id falla con 400 si intenta cambiar el tipo', async () => {
    await request(app.getHttpServer())
      .patch(`/movimientos/${movimientoCreadoId}`)
      .send({ tipo: 'INGRESO' })
      .expect(400);
  });

  it('PATCH /movimientos/:id actualiza el nombre', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/movimientos/${movimientoCreadoId}`)
      .send({ nombre: 'Compra E2E modificada' })
      .expect(200);

    expect(res.body.nombre).toBe('Compra E2E modificada');
  });

  it('DELETE /movimientos/:id elimina el movimiento', async () => {
    await request(app.getHttpServer())
      .delete(`/movimientos/${movimientoCreadoId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/movimientos/${movimientoCreadoId}`)
      .expect(404);
  });
});