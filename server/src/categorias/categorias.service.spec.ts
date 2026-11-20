import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoMovimientoCategoria } from '../generated/prisma/enums.js';

describe('CategoriasService', () => {
  let service: CategoriasService;

  const prismaServiceMock = {
    categoria: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

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

  describe('create', () => {
    it('normaliza el nombre antes de guardar', async () => {
      prismaServiceMock.categoria.create.mockResolvedValue({
        categoriaId: 1,
        nombre: 'Comida rapida',
        tipo: TipoMovimientoCategoria.GASTO,
      });

      await service.create({
        nombre: '  cOMIDA   RAPIDA ',
        tipo: TipoMovimientoCategoria.GASTO,
      });

      expect(prismaServiceMock.categoria.create).toHaveBeenCalledWith({
        data: { nombre: 'Comida rapida', tipo: TipoMovimientoCategoria.GASTO },
      });
    });

    it('lanza BadRequestException si el nombre queda vacío', async () => {
      await expect(
        service.create({
          nombre: '   ',
          tipo: TipoMovimientoCategoria.GASTO,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaServiceMock.categoria.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('normaliza el nombre antes de actualizar', async () => {
      // update llama primero a findOne, que usa findUnique para comprobar que existe
      prismaServiceMock.categoria.findUnique.mockResolvedValue({
        categoriaId: 1,
        nombre: 'Ocio',
        tipo: TipoMovimientoCategoria.GASTO,
      });
      prismaServiceMock.categoria.update.mockResolvedValue({
        categoriaId: 1,
        nombre: 'Ocio y cine',
      });

      await service.update(1, { nombre: ' ocio   Y CINE ' });

      expect(prismaServiceMock.categoria.update).toHaveBeenCalledWith({
        where: { categoriaId: 1 },
        data: { nombre: 'Ocio y cine' },
      });
    });
  });
});
