// test/dashboard.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { Prisma } from '../src/generated/prisma/client.js';

describe('Dashboard (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cuentaBaseId: number;
  let cuentaDestinoId: number;
  let categoriaGastoId: number;
  let categoriaIngresoId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get(PrismaService);
    await app.init();

    const cuentaBase = await prisma.cuenta.create({
      data: { nombre: 'Cuenta dashboard E2E', saldoInicial: 0 },
    });
    const cuentaDestino = await prisma.cuenta.create({
      data: { nombre: 'Cuenta destino dashboard E2E', saldoInicial: 0 },
    });
    const categoriaGasto = await prisma.categoria.upsert({
      where: { nombre_tipo: { nombre: 'Dashboard E2E', tipo: 'GASTO' } },
      update: {},
      create: { nombre: 'Dashboard E2E', tipo: 'GASTO' },
    });
    const categoriaIngreso = await prisma.categoria.upsert({
      where: { nombre_tipo: { nombre: 'Dashboard E2E', tipo: 'INGRESO' } },
      update: {},
      create: { nombre: 'Dashboard E2E', tipo: 'INGRESO' },
    });
    cuentaBaseId = cuentaBase.cuentaId;
    cuentaDestinoId = cuentaDestino.cuentaId;
    categoriaGastoId = categoriaGasto.categoriaId;
    categoriaIngresoId = categoriaIngreso.categoriaId;
  });

  afterAll(async () => {
    // Orden importante: movimientos primero (FK Restrict hacia cuenta y categoría)
    await prisma.movimiento.deleteMany({
      where: { OR: [{ cuentaBaseId }, { cuentaDestinoId }] },
    });
    await prisma.cuenta.deleteMany({
      where: { cuentaId: { in: [cuentaBaseId, cuentaDestinoId] } },
    });
    await prisma.categoria.deleteMany({
      where: { categoriaId: { in: [categoriaGastoId, categoriaIngresoId] } },
    });
    await app.close();
  });

  it('GET /dashboard devuelve periodo, totales y ultimos', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboard')
      .expect(200);

    expect(res.body).toEqual({
      periodo: { desde: expect.any(String), hasta: expect.any(String) },
      totales: {
        ingresos: expect.any(String),
        gastos: expect.any(String),
        queda: expect.any(String),
      },
      ultimos: expect.any(Array),
    });
    expect(res.body.ultimos.length).toBeLessThanOrEqual(5);
  });

  it('GET /dashboard suma ingresos y gastos del periodo y excluye transferencias', async () => {
    // La BD puede tener datos previos: se compara antes y después
    const antes = await request(app.getHttpServer()).get('/dashboard');

    // fecha por defecto = now(), dentro del periodo actual
    await prisma.movimiento.create({
      data: {
        nombre: 'Ingreso dashboard E2E',
        monto: 100,
        tipo: 'INGRESO',
        cuentaBaseId,
        categoriaId: categoriaIngresoId,
      },
    });
    const gasto = await prisma.movimiento.create({
      data: {
        nombre: 'Gasto dashboard E2E',
        monto: 30.5,
        tipo: 'GASTO',
        cuentaBaseId,
        categoriaId: categoriaGastoId,
      },
    });
    const transferencia = await prisma.movimiento.create({
      data: {
        nombre: 'Transferencia dashboard E2E',
        monto: 999,
        tipo: 'TRANSFERENCIA',
        cuentaBaseId,
        cuentaDestinoId,
      },
    });

    const despues = await request(app.getHttpServer())
      .get('/dashboard')
      .expect(200);

    const diferencia = (clave: 'ingresos' | 'gastos' | 'queda') =>
      new Prisma.Decimal(despues.body.totales[clave])
        .minus(antes.body.totales[clave])
        .toString();

    expect(diferencia('ingresos')).toBe('100');
    expect(diferencia('gastos')).toBe('30.5');
    expect(diferencia('queda')).toBe('69.5');

    const ids = despues.body.ultimos.map(
      (m: { movimientoId: number }) => m.movimientoId,
    );
    expect(ids[0]).toBe(gasto.movimientoId);
    expect(ids).not.toContain(transferencia.movimientoId);
    expect(despues.body.ultimos[0]).toEqual({
      movimientoId: gasto.movimientoId,
      nombre: 'Gasto dashboard E2E',
      monto: '30.5',
      tipo: 'GASTO',
      categoria: { nombre: 'Dashboard E2E' },
    });
  });

  it('GET /dashboard no cuenta movimientos de fuera del periodo', async () => {
    const antes = await request(app.getHttpServer()).get('/dashboard');
    const desde = new Date(antes.body.periodo.desde);

    // Un día antes del inicio del periodo
    await prisma.movimiento.create({
      data: {
        nombre: 'Gasto antiguo dashboard E2E',
        monto: 500,
        tipo: 'GASTO',
        fecha: new Date(desde.getTime() - 24 * 60 * 60 * 1000),
        cuentaBaseId,
        categoriaId: categoriaGastoId,
      },
    });

    const despues = await request(app.getHttpServer())
      .get('/dashboard')
      .expect(200);

    expect(despues.body.totales.gastos).toBe(antes.body.totales.gastos);
  });
});
