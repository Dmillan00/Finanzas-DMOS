// test/categorias.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('categorias (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let categoriaCreadaId: number;
  let categoriaIngresoId: number;

  // Únicos por ejecución y ya en la forma que devuelve la API
  // (primera letra en mayúscula, resto en minúscula)
  const SUFIJO = Date.now();
  const NOMBRE = `Categoria e2e ${SUFIJO}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    prisma = app.get(PrismaService);
    await app.init();

    const categoria = await prisma.categoria.create({
      data: { nombre: NOMBRE, tipo: 'GASTO' },
    });
    categoriaCreadaId = categoria.categoriaId;
  });

  afterAll(async () => {
    await prisma.categoria.deleteMany({
      where: { categoriaId: categoriaCreadaId },
    });
    if (categoriaIngresoId) {
      await prisma.categoria.deleteMany({
        where: { categoriaId: categoriaIngresoId },
      });
    }
    await app.close();
  });

  it('POST /categorias falla con 409 si el nombre ya existe con el mismo tipo', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .send({ nombre: NOMBRE, tipo: 'GASTO' })
      .expect(409);
  });

  it('POST /categorias permite el mismo nombre con otro tipo', async () => {
    const res = await request(app.getHttpServer())
      .post('/categorias')
      .send({ nombre: NOMBRE, tipo: 'INGRESO' })
      .expect(201);

    categoriaIngresoId = res.body.categoriaId;
  });

  it('POST /categorias falla con 400 si falta nombre', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .send({ tipo: 'GASTO' })
      .expect(400);
  });

  it('POST /categorias falla con 400 si falta tipo', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .send({ nombre: 'Sin tipo' })
      .expect(400);
  });

  it('POST /categorias falla con 400 si el tipo es TRANSFERENCIA', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .send({ nombre: 'Transfer', tipo: 'TRANSFERENCIA' })
      .expect(400);
  });

  it('GET /categorias?tipo=TRANSFERENCIA devuelve 400', async () => {
    await request(app.getHttpServer())
      .get('/categorias?tipo=TRANSFERENCIA')
      .expect(400);
  });

  it('PATCH /categorias/:id falla con 400 si intenta cambiar el tipo', async () => {
    await request(app.getHttpServer())
      .patch(`/categorias/${categoriaCreadaId}`)
      .send({ tipo: 'INGRESO' })
      .expect(400);
  });

  it('PATCH /categorias/:id pone límite a una categoría de GASTO', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/categorias/${categoriaCreadaId}`)
      .send({ limite: 150 })
      .expect(200);

    // Decimal llega como string
    expect(Number(res.body.limite)).toBe(150);
  });

  it('PATCH /categorias/:id quita el límite con limite: null', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/categorias/${categoriaCreadaId}`)
      .send({ limite: null })
      .expect(200);

    expect(res.body.limite).toBeNull();
  });

  it('PATCH /categorias/:id falla con 400 si pone límite a una de INGRESO', async () => {
    await request(app.getHttpServer())
      .patch(`/categorias/${categoriaIngresoId}`)
      .send({ limite: 150 })
      .expect(400);
  });

  it('POST /categorias falla con 400 si una de INGRESO lleva límite', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .send({
        nombre: `Ingreso limite ${SUFIJO}`,
        tipo: 'INGRESO',
        limite: 150,
      })
      .expect(400);
  });

  it('POST /categorias falla con 400 si el límite es negativo', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .send({ nombre: `Limite negativo ${SUFIJO}`, tipo: 'GASTO', limite: -10 })
      .expect(400);
  });

  it('POST /categorias falla con 400 si el límite tiene más de 2 decimales', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .send({
        nombre: `Limite decimales ${SUFIJO}`,
        tipo: 'GASTO',
        limite: 1.234,
      })
      .expect(400);
  });
});
