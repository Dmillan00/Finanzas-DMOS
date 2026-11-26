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
  // Cuentas creadas por la API durante los tests, para limpiarlas al final
  const idsCreados: number[] = [];

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
    const ids = [cuentaCreadaId, ...idsCreados];
    // Orden importante: movimientos primero (FK Restrict hacia cuenta)
    await prisma.movimiento.deleteMany({
      where: {
        OR: [{ cuentaBaseId: { in: ids } }, { cuentaDestinoId: { in: ids } }],
      },
    });
    await prisma.cuenta.deleteMany({ where: { cuentaId: { in: ids } } });
    await app.close();
  });

  it('POST /cuentas crea la cuenta y devuelve saldoActual igual al inicial', async () => {
    const res = await request(app.getHttpServer())
      .post('/cuentas')
      .send({ nombre: 'Cuenta E2E nueva', saldoInicial: 200 })
      .expect(201);

    idsCreados.push(res.body.cuentaId);
    // Decimal llega como string
    expect(Number(res.body.saldoActual)).toBe(200);
  });

  it('POST /cuentas falla con 400 si falta nombre', async () => {
    await request(app.getHttpServer())
      .post('/cuentas')
      .send({ saldoInicial: 500 })
      .expect(400);
  });

  it('POST /cuentas falla con 400 si saldoInicial no es un número', async () => {
    await request(app.getHttpServer())
      .post('/cuentas')
      .send({ nombre: 'Cuenta E2E', saldoInicial: 'abc' })
      .expect(400);
  });

  it('GET /cuentas devuelve la lista con saldoActual', async () => {
    const res = await request(app.getHttpServer()).get('/cuentas').expect(200);

    const cuenta = res.body.find(
      (c: { cuentaId: number }) => c.cuentaId === cuentaCreadaId,
    );
    expect(cuenta).toBeDefined();
    expect(Number(cuenta.saldoActual)).toBe(500);
  });

  it('GET /cuentas/:id devuelve la cuenta con saldoActual', async () => {
    const res = await request(app.getHttpServer())
      .get(`/cuentas/${cuentaCreadaId}`)
      .expect(200);

    expect(res.body.cuentaId).toBe(cuentaCreadaId);
    expect(Number(res.body.saldoActual)).toBe(500);
  });

  it('GET /cuentas/:id falla con 404 si no existe', async () => {
    await request(app.getHttpServer()).get('/cuentas/999999999').expect(404);
  });

  it('PATCH /cuentas/:id actualiza el nombre', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/cuentas/${cuentaCreadaId}`)
      .send({ nombre: 'Cuenta E2E editada' })
      .expect(200);

    expect(res.body.nombre).toBe('Cuenta E2E editada');
  });

  it('PATCH /cuentas/:id falla con 404 si no existe', async () => {
    await request(app.getHttpServer())
      .patch('/cuentas/999999999')
      .send({ nombre: 'No existe' })
      .expect(404);
  });

  it('DELETE /cuentas/:id borra la cuenta y después da 404', async () => {
    const creada = await request(app.getHttpServer())
      .post('/cuentas')
      .send({ nombre: 'Cuenta E2E borrar', saldoInicial: 0 })
      .expect(201);
    const id = creada.body.cuentaId;
    idsCreados.push(id);

    await request(app.getHttpServer()).delete(`/cuentas/${id}`).expect(200);
    await request(app.getHttpServer()).get(`/cuentas/${id}`).expect(404);
  });

  it('DELETE /cuentas/:id falla con 404 si no existe', async () => {
    await request(app.getHttpServer()).delete('/cuentas/999999999').expect(404);
  });
});
