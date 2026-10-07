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

  // Únicos por ejecución y ya en la forma que devuelve la API
  // (primera letra en mayúscula, resto en minúscula)
  const SUFIJO = Date.now();
  const NOMBRE = `Categoria e2e ${SUFIJO}`;
  const NOMBRE_MODIFICADO = `Categoria e2e mod ${SUFIJO}`;

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
    if (categoriaCreadaId) {
      await prisma.categoria.deleteMany({
        where: { categoriaId: categoriaCreadaId },
      });
    }
    await app.close();
  });

  it('POST /categorias crea una categoría', async () => {
    const res = await request(app.getHttpServer())
      .post('/categorias')
      .send({ nombre: NOMBRE })
      .expect(201);

    expect(res.body).toMatchObject({ nombre: NOMBRE });
    expect(res.body.categoriaId).toBeDefined();

    categoriaCreadaId = res.body.categoriaId;
  });

  it('POST /categorias falla con 409 si el nombre ya existe', async () => {
    await request(app.getHttpServer())
      .post('/categorias')
      .send({ nombre: NOMBRE })
      .expect(409);
  });

  it('POST /categorias falla con 400 si falta nombre', async () => {
    await request(app.getHttpServer()).post('/categorias').send({}).expect(400);
  });

  it('GET /categorias devuelve un array con la categoría creada', async () => {
    const res = await request(app.getHttpServer())
      .get('/categorias')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some(
        (c: { categoriaId: number }) => c.categoriaId === categoriaCreadaId,
      ),
    ).toBe(true);
  });

  it('GET /categorias/:id devuelve la categoría', async () => {
    const res = await request(app.getHttpServer())
      .get(`/categorias/${categoriaCreadaId}`)
      .expect(200);

    expect(res.body.categoriaId).toBe(categoriaCreadaId);
    expect(res.body.nombre).toBe(NOMBRE);
  });

  it('GET /categorias/:id devuelve 404 si no existe', async () => {
    await request(app.getHttpServer()).get('/categorias/999999').expect(404);
  });

  it('PATCH /categorias/:id actualiza el nombre', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/categorias/${categoriaCreadaId}`)
      .send({ nombre: NOMBRE_MODIFICADO })
      .expect(200);

    expect(res.body.nombre).toBe(NOMBRE_MODIFICADO);
  });

  it('PATCH /categorias/:id devuelve 404 si no existe', async () => {
    await request(app.getHttpServer())
      .patch('/categorias/999999')
      .send({ nombre: 'x' })
      .expect(404);
  });

  it('DELETE /categorias/:id devuelve 404 si no existe', async () => {
    await request(app.getHttpServer()).delete('/categorias/999999').expect(404);
  });

  it('DELETE /categorias/:id elimina la categoría', async () => {
    await request(app.getHttpServer())
      .delete(`/categorias/${categoriaCreadaId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/categorias/${categoriaCreadaId}`)
      .expect(404);

    categoriaCreadaId = 0; // ya no hace falta limpiarla en afterAll
  });
});