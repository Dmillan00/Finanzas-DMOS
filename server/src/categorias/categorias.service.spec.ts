import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

describe('CategoriasService', () => {
  let service: CategoriasService;

  const prismaServiceMock = {
    categoria: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const prismaError = (code: string) =>
    new Prisma.PrismaClientKnownRequestError('error', {
      code,
      clientVersion: '7.0.0',
    });

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriasService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCategoria', () => {
    it('crea una categoría', async () => {
      const dto = { nombre: 'Comida' };
      const creada = { categoriaId: 1, ...dto };
      prismaServiceMock.categoria.create.mockResolvedValue(creada);

      const resultado = await service.createCategoria(dto);

      expect(resultado).toEqual(creada);
      expect(prismaServiceMock.categoria.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('lanza ConflictException si el nombre ya existe (P2002)', async () => {
      prismaServiceMock.categoria.create.mockRejectedValue(
        prismaError('P2002'),
      );

      await expect(service.createCategoria({ nombre: 'Comida' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('relanza errores desconocidos', async () => {
      const otro = new Error('boom');
      prismaServiceMock.categoria.create.mockRejectedValue(otro);

      await expect(service.createCategoria({ nombre: 'x' })).rejects.toBe(otro);
    });
  });

  describe('getCategorias', () => {
    it('devuelve todas las categorías', async () => {
      const lista = [
        { categoriaId: 1, nombre: 'Comida' },
        { categoriaId: 2, nombre: 'Ocio' },
      ];
      prismaServiceMock.categoria.findMany.mockResolvedValue(lista);

      const resultado = await service.getCategorias();

      expect(resultado).toEqual(lista);
    });
  });

  describe('getCategoria', () => {
    it('devuelve la categoría si existe', async () => {
      const fake = { categoriaId: 1, nombre: 'Comida' };
      prismaServiceMock.categoria.findUnique.mockResolvedValue(fake);

      const resultado = await service.getCategoria(1);

      expect(resultado).toEqual(fake);
      expect(prismaServiceMock.categoria.findUnique).toHaveBeenCalledWith({
        where: { categoriaId: 1 },
      });
    });

    it('lanza NotFoundException si no existe', async () => {
      prismaServiceMock.categoria.findUnique.mockResolvedValue(null);

      await expect(service.getCategoria(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCategoria', () => {
    it('actualiza la categoría', async () => {
      const actualizada = { categoriaId: 1, nombre: 'Restaurantes' };
      prismaServiceMock.categoria.update.mockResolvedValue(actualizada);

      const resultado = await service.updateCategoria(1, {
        nombre: 'Restaurantes',
      });

      expect(resultado).toEqual(actualizada);
      expect(prismaServiceMock.categoria.update).toHaveBeenCalledWith({
        where: { categoriaId: 1 },
        data: { nombre: 'Restaurantes' },
      });
    });

    it('lanza NotFoundException si no existe (P2025)', async () => {
      prismaServiceMock.categoria.update.mockRejectedValue(
        prismaError('P2025'),
      );

      await expect(
        service.updateCategoria(99, { nombre: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nombre ya existe (P2002)', async () => {
      prismaServiceMock.categoria.update.mockRejectedValue(
        prismaError('P2002'),
      );

      await expect(
        service.updateCategoria(1, { nombre: 'Ocio' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteCategoria', () => {
    it('elimina la categoría', async () => {
      const eliminada = { categoriaId: 1, nombre: 'Comida' };
      prismaServiceMock.categoria.delete.mockResolvedValue(eliminada);

      const resultado = await service.deleteCategoria(1);

      expect(resultado).toEqual(eliminada);
    });

    it('lanza NotFoundException si no existe (P2025)', async () => {
      prismaServiceMock.categoria.delete.mockRejectedValue(
        prismaError('P2025'),
      );

      await expect(service.deleteCategoria(99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza ConflictException si tiene movimientos (P2003)', async () => {
      prismaServiceMock.categoria.delete.mockRejectedValue(
        prismaError('P2003'),
      );

      await expect(service.deleteCategoria(1)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});