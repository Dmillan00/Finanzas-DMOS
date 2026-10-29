import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { TipoMovimientoCategoria } from '../generated/prisma/enums.js';

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
    it('normaliza el nombre antes de guardar', async () => {
      prismaServiceMock.categoria.create.mockResolvedValue({
        categoriaId: 1,
        nombre: 'Comida rapida',
        tipo: TipoMovimientoCategoria.GASTO,
      });

      await service.createCategoria({
        nombre: '  cOMIDA   RAPIDA ',
        tipo: TipoMovimientoCategoria.GASTO,
      });

      expect(prismaServiceMock.categoria.create).toHaveBeenCalledWith({
        data: { nombre: 'Comida rapida', tipo: TipoMovimientoCategoria.GASTO },
      });
    });

    it('lanza BadRequestException si el nombre queda vacío', async () => {
      await expect(
        service.createCategoria({
          nombre: '   ',
          tipo: TipoMovimientoCategoria.GASTO,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaServiceMock.categoria.create).not.toHaveBeenCalled();
    });

    it('crea una categoría', async () => {
      const dto = { nombre: 'Comida', tipo: TipoMovimientoCategoria.GASTO };
      const creada = { categoriaId: 1, ...dto };
      prismaServiceMock.categoria.create.mockResolvedValue(creada);

      const resultado = await service.createCategoria(dto);

      expect(resultado).toEqual(creada);
      expect(prismaServiceMock.categoria.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('lanza ConflictException si el nombre ya existe para ese tipo (P2002)', async () => {
      prismaServiceMock.categoria.create.mockRejectedValue(
        prismaError('P2002'),
      );

      await expect(
        service.createCategoria({
          nombre: 'Comida',
          tipo: TipoMovimientoCategoria.GASTO,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('relanza errores desconocidos', async () => {
      const otro = new Error('boom');
      prismaServiceMock.categoria.create.mockRejectedValue(otro);

      await expect(
        service.createCategoria({
          nombre: 'x',
          tipo: TipoMovimientoCategoria.GASTO,
        }),
      ).rejects.toBe(otro);
    });
  });

  describe('getCategorias', () => {
    it('devuelve todas las categorías', async () => {
      const lista = [
        {
          categoriaId: 1,
          nombre: 'Comida',
          tipo: TipoMovimientoCategoria.GASTO,
        },
        {
          categoriaId: 2,
          nombre: 'Nomina',
          tipo: TipoMovimientoCategoria.INGRESO,
        },
      ];
      prismaServiceMock.categoria.findMany.mockResolvedValue(lista);

      const resultado = await service.getCategorias();

      expect(resultado).toEqual(lista);
    });

    it('filtra por tipo cuando se indica', async () => {
      const lista = [
        {
          categoriaId: 1,
          nombre: 'Comida',
          tipo: TipoMovimientoCategoria.GASTO,
        },
      ];
      prismaServiceMock.categoria.findMany.mockResolvedValue(lista);

      const resultado = await service.getCategorias(
        TipoMovimientoCategoria.GASTO,
      );

      expect(resultado).toEqual(lista);
      expect(prismaServiceMock.categoria.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tipo: TipoMovimientoCategoria.GASTO },
        }),
      );
    });

    it('no filtra por tipo si no se indica', async () => {
      prismaServiceMock.categoria.findMany.mockResolvedValue([]);

      await service.getCategorias();

      expect(prismaServiceMock.categoria.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tipo: undefined } }),
      );
    });
  });

  describe('getCategoria', () => {
    it('devuelve la categoría si existe', async () => {
      const fake = {
        categoriaId: 1,
        nombre: 'Comida',
        tipo: TipoMovimientoCategoria.GASTO,
      };
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
      const eliminada = {
        categoriaId: 1,
        nombre: 'Comida',
        tipo: TipoMovimientoCategoria.GASTO,
      };
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
