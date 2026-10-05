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
  });

  afterAll(async () => {
    if (cuentaCreadaId) {
      await prisma.cuenta.deleteMany({ where: { cuentaId: cuentaCreadaId } });
    }
    await app.close();
  });

  it('POST /cuentas crea una cuenta', async () => {
    const res = await request(app.getHttpServer())
      .post('/cuentas')
      .send({ nombre: 'Cuenta E2E', saldoInicial: 500 })
      .expect(201);

    expect(res.body).toMatchObject({
      nombre: 'Cuenta E2E',
      saldoInicial: '500',
    });
    expect(res.body.cuentaId).toBeDefined();

    cuentaCreadaId = res.body.cuentaId;
  });

  it('POST /cuentas falla con 400 si falta nombre', async () => {
    await request(app.getHttpServer())
      .post('/cuentas')
      .send({ saldoInicial: 500 })
      .expect(400);
  });

  it('GET /cuentas devuelve un array con la cuenta creada', async () => {
    const res = await request(app.getHttpServer()).get('/cuentas').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some((c: { cuentaId: number }) => c.cuentaId === cuentaCreadaId),
    ).toBe(true);
  });

  it('GET /cuentas/:id devuelve la cuenta con saldoActual', async () => {
    const res = await request(app.getHttpServer())
      .get(`/cuentas/${cuentaCreadaId}`)
      .expect(200);

    expect(res.body.cuentaId).toBe(cuentaCreadaId);
    expect(res.body.saldoActual).toBeDefined();
  });

  it('GET /cuentas/:id devuelve 404 si no existe', async () => {
    await request(app.getHttpServer()).get('/cuentas/999999').expect(404);
  });

  it('PATCH /cuentas/:id actualiza el nombre', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/cuentas/${cuentaCreadaId}`)
      .send({ nombre: 'Cuenta E2E modificada' })
      .expect(200);

    expect(res.body.nombre).toBe('Cuenta E2E modificada');
  });

  it('PATCH /cuentas/:id devuelve 404 si no existe', async () => {
    await request(app.getHttpServer())
      .patch('/cuentas/999999')
      .send({ nombre: 'x' })
      .expect(404);
  });

  it('DELETE /cuentas/:id elimina la cuenta', async () => {
    await request(app.getHttpServer())
      .delete(`/cuentas/${cuentaCreadaId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/cuentas/${cuentaCreadaId}`)
      .expect(404);

    cuentaCreadaId = 0; // ya no hace falta limpiarla en afterAll
  });
});
