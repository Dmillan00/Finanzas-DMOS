import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MovimientosService } from './movimientos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, TipoMovimiento } from '../generated/prisma/client.js';

describe('MovimientosService', () => {
  let service: MovimientosService;

  const prismaServiceMock = {
    movimiento: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
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
        MovimientosService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<MovimientosService>(MovimientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMovimiento', () => {
    it('crea un INGRESO con categoría y sin cuenta destino', async () => {
    it('crea un INGRESO con categoría y sin cuenta destino', async () => {
      const dto = {
        nombre: 'Nómina',
        monto: 1500,
        tipo: TipoMovimiento.INGRESO,
        cuentaBaseId: 1,
        categoriaId: 1,
        categoriaId: 1,
      };
      const creado = { movimientoId: 1, ...dto };
      prismaServiceMock.movimiento.create.mockResolvedValue(creado);

      const resultado = await service.createMovimiento(dto);

      expect(resultado).toEqual(creado);
      expect(prismaServiceMock.movimiento.create).toHaveBeenCalledWith({
        data: dto,
        include: { categoria: true },
        include: { categoria: true },
      });
    });

    it('crea una TRANSFERENCIA con destino y sin categoría', async () => {
      const dto = {
        nombre: 'Hucha',
        monto: 50,
        tipo: TipoMovimiento.TRANSFERENCIA,
        cuentaBaseId: 1,
        cuentaDestinoId: 2,
      };
      prismaServiceMock.movimiento.create.mockResolvedValue({
        movimientoId: 1,
        ...dto,
      });

      await service.createMovimiento(dto);

      expect(prismaServiceMock.movimiento.create).toHaveBeenCalled();
    });

    it('lanza BadRequestException si INGRESO/GASTO no tiene categoría', async () => {
      const dto = {
        nombre: 'Compra',
        monto: 10,
        tipo: TipoMovimiento.GASTO,
        cuentaBaseId: 1,
      };

      await expect(service.createMovimiento(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaServiceMock.movimiento.create).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si TRANSFERENCIA tiene categoría', async () => {
      const dto = {
        nombre: 'Transfer',
        monto: 100,
        tipo: TipoMovimiento.TRANSFERENCIA,
        cuentaBaseId: 1,
        cuentaDestinoId: 2,
        categoriaId: 1,
      };

      await expect(service.createMovimiento(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si TRANSFERENCIA no tiene cuentaDestinoId', async () => {
      const dto = {
        nombre: 'Transfer',
        monto: 100,
        tipo: TipoMovimiento.TRANSFERENCIA,
        cuentaBaseId: 1,
      };

      await expect(service.createMovimiento(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaServiceMock.movimiento.create).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si GASTO tiene cuentaDestinoId', async () => {
      const dto = {
        nombre: 'Gasto raro',
        monto: 100,
        tipo: TipoMovimiento.GASTO,
        cuentaBaseId: 1,
        categoriaId: 1,
        cuentaDestinoId: 2,
        categoriaId: 1,
      };

      await expect(service.createMovimiento(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaServiceMock.movimiento.create).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si cuentaBase === cuentaDestino', async () => {
      const dto = {
        nombre: 'Transfer',
        monto: 100,
        tipo: TipoMovimiento.TRANSFERENCIA,
        cuentaBaseId: 1,
        cuentaDestinoId: 1,
      };

      await expect(service.createMovimiento(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si la cuenta o categoría no existe (P2003)', async () => {
      const dto = {
        nombre: 'Gasto',
        monto: 100,
        tipo: TipoMovimiento.GASTO,
        cuentaBaseId: 999,
        categoriaId: 1,
      };
      prismaServiceMock.movimiento.create.mockRejectedValue(
        errorPrisma('P2003'),
      );

      await expect(service.createMovimiento(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getMovimientoById', () => {
    it('devuelve el movimiento si existe', async () => {
      const fake = { movimientoId: 1, nombre: 'Compra' };
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(fake);

      const resultado = await service.getMovimientoById(1);

      expect(resultado).toEqual(fake);
    });

    it('lanza NotFoundException si no existe', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(null);

      await expect(service.getMovimientoById(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getMovimientos', () => {
    it('lanza BadRequestException si hay month sin year', async () => {
      await expect(service.getMovimientos(undefined, 10)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si month es inválido (13)', async () => {
      await expect(service.getMovimientos(2026, 13)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si month es inválido (0)', async () => {
      await expect(service.getMovimientos(2026, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('lanza BadRequestException si month es inválido (0)', async () => {
      await expect(service.getMovimientos(2026, 0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('filtra por year y month cuando son válidos', async () => {
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);

      await service.getMovimientos(2026, 10);

      expect(prismaServiceMock.movimiento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            fecha: {
              gte: new Date(Date.UTC(2026, 9, 1)),
              lt: new Date(Date.UTC(2026, 10, 1)),
            },
          },
        }),
      );
    });

    it('filtra todo el año si solo hay year', async () => {
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);

      await service.getMovimientos(2026);

      expect(prismaServiceMock.movimiento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            fecha: {
              gte: new Date(Date.UTC(2026, 0, 1)),
              lt: new Date(Date.UTC(2027, 0, 1)),
            },
          },
        }),
      );
    });

    it('sin filtros usa where vacío', async () => {
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);

      await service.getMovimientos();

      expect(prismaServiceMock.movimiento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('updateMovimiento', () => {
    const existenteGasto = {
      movimientoId: 1,
      tipo: TipoMovimiento.GASTO,
      cuentaBaseId: 1,
      cuentaDestinoId: null,
      categoriaId: 1,
    };

    const existenteGasto = {
      movimientoId: 1,
      tipo: TipoMovimiento.GASTO,
      cuentaBaseId: 1,
      cuentaDestinoId: null,
      categoriaId: 1,
    };

    it('lanza NotFoundException si no existe', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMovimiento(99, { nombre: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si intenta cambiar el tipo', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);

      await expect(
        service.updateMovimiento(2, { categoriaId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si un GASTO recibe cuentaDestinoId', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);

      await expect(
        service.updateMovimiento(1, { cuentaDestinoId: 2 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si una TRANSFERENCIA recibe categoriaId', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue({
        movimientoId: 2,
        tipo: TipoMovimiento.TRANSFERENCIA,
        cuentaBaseId: 1,
        cuentaDestinoId: 2,
        categoriaId: null,
      });

      await expect(
        service.updateMovimiento(2, { categoriaId: 1 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('actualiza correctamente si los datos son válidos', async () => {
      const actualizado = { ...existenteGasto, nombre: 'Nuevo nombre' };
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);
      prismaServiceMock.movimiento.update.mockResolvedValue(actualizado);

      const resultado = await service.updateMovimiento(1, {
        nombre: 'Nuevo nombre',
      });

      expect(resultado).toEqual(actualizado);
    });

    it('lanza NotFoundException si update falla con P2025', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);
      prismaServiceMock.movimiento.update.mockRejectedValue(
        errorPrisma('P2025'),
      );

      await expect(
        service.updateMovimiento(1, { nombre: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si update falla con P2003', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);
      prismaServiceMock.movimiento.update.mockRejectedValue(
        errorPrisma('P2003'),
      );

      await expect(
        service.updateMovimiento(1, { categoriaId: 999 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteMovimiento', () => {
    it('elimina correctamente', async () => {
      const eliminado = { movimientoId: 1, nombre: 'Compra' };
      prismaServiceMock.movimiento.delete.mockResolvedValue(eliminado);

      const resultado = await service.deleteMovimiento(1);

      expect(resultado).toEqual(eliminado);
    });

    it('lanza NotFoundException si no existe (P2025)', async () => {
      prismaServiceMock.movimiento.delete.mockRejectedValue(
        errorPrisma('P2025'),
      );

      await expect(service.deleteMovimiento(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});