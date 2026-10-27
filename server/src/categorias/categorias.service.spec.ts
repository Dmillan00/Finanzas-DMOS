import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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

  const errorPrisma = (code: string) =>
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
    it('normaliza el nombre antes de guardar', async () => {
      prismaServiceMock.categoria.create.mockResolvedValue({
        categoriaId: 1,
        nombre: 'Comida rapida',
      });

      await service.createCategoria({ nombre: '  cOMIDA   RAPIDA ' });

      expect(prismaServiceMock.categoria.create).toHaveBeenCalledWith({
        data: { nombre: 'Comida rapida' },
      });
    });

    it('lanza BadRequestException si el nombre queda vacío', async () => {
      await expect(service.createCategoria({ nombre: '   ' })).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaServiceMock.categoria.create).not.toHaveBeenCalled();
    });

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
        errorPrisma('P2002'),
      );

      await expect(
        service.createCategoria({ nombre: 'Comida' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getCategorias', () => {
    it('devuelve la lista', async () => {
      const lista = [{ categoriaId: 1, nombre: 'Comida' }];
      prismaServiceMock.categoria.findMany.mockResolvedValue(lista);

      expect(await service.getCategorias()).toEqual(lista);
    });
  });

  describe('getCategoria', () => {
    it('devuelve la categoría si existe', async () => {
      const fake = { categoriaId: 1, nombre: 'Comida' };
      prismaServiceMock.categoria.findUnique.mockResolvedValue(fake);

      expect(await service.getCategoria(1)).toEqual(fake);
    });

    it('lanza NotFoundException si no existe', async () => {
      prismaServiceMock.categoria.findUnique.mockResolvedValue(null);

      await expect(service.getCategoria(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCategoria', () => {
    it('normaliza el nombre antes de actualizar', async () => {
      prismaServiceMock.categoria.update.mockResolvedValue({
        categoriaId: 1,
        nombre: 'Ocio y cine',
      });

      await service.updateCategoria(1, { nombre: ' ocio   Y CINE ' });

      expect(prismaServiceMock.categoria.update).toHaveBeenCalledWith({
        where: { categoriaId: 1 },
        data: { nombre: 'Ocio y cine' },
      });
    });

    it('actualiza la categoría', async () => {
      const actualizada = { categoriaId: 1, nombre: 'Ocio' };
      prismaServiceMock.categoria.update.mockResolvedValue(actualizada);

      const resultado = await service.updateCategoria(1, { nombre: 'Ocio' });

      expect(resultado).toEqual(actualizada);
      expect(prismaServiceMock.categoria.update).toHaveBeenCalledWith({
        where: { categoriaId: 1 },
        data: { nombre: 'Ocio' },
      });
    });

    it('lanza NotFoundException si no existe (P2025)', async () => {
      prismaServiceMock.categoria.update.mockRejectedValue(
        errorPrisma('P2025'),
      );

      await expect(
        service.updateCategoria(99, { nombre: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si el nombre ya existe (P2002)', async () => {
      prismaServiceMock.categoria.update.mockRejectedValue(
        errorPrisma('P2002'),
      );

      await expect(
        service.updateCategoria(1, { nombre: 'Comida' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteCategoria', () => {
    it('elimina la categoría', async () => {
      const eliminada = { categoriaId: 1, nombre: 'Comida' };
      prismaServiceMock.categoria.delete.mockResolvedValue(eliminada);

      expect(await service.deleteCategoria(1)).toEqual(eliminada);
    });

    it('lanza NotFoundException si no existe (P2025)', async () => {
      prismaServiceMock.categoria.delete.mockRejectedValue(
        errorPrisma('P2025'),
      );

      await expect(service.deleteCategoria(99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza ConflictException si tiene movimientos (P2003)', async () => {
      prismaServiceMock.categoria.delete.mockRejectedValue(
        errorPrisma('P2003'),
      );

      await expect(service.deleteCategoria(1)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
