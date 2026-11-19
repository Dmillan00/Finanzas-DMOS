import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MovimientosService } from './movimientos.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoMovimiento } from '../generated/prisma/client.js';

describe('MovimientosService', () => {
  let service: MovimientosService;

  const prismaServiceMock = {
    movimiento: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    categoria: {
      findUnique: vi.fn(),
    },
  };

  const categoriaGasto = {
    categoriaId: 1,
    nombre: 'Comida',
    tipo: TipoMovimiento.GASTO,
  };
  const categoriaIngreso = {
    categoriaId: 2,
    nombre: 'Nomina',
    tipo: TipoMovimiento.INGRESO,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // 1 = categoría de GASTO, 2 = de INGRESO, cualquier otro id no existe
    prismaServiceMock.categoria.findUnique.mockImplementation(
      ({ where }: { where: { categoriaId: number } }) =>
        Promise.resolve(
          [categoriaGasto, categoriaIngreso].find(
            (c) => c.categoriaId === where.categoriaId,
          ) ?? null,
        ),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientosService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<MovimientosService>(MovimientosService);
  });

  describe('createMovimiento', () => {
    it('convierte fecha YYYY-MM-DD a Date al crear', async () => {
      const dto = {
        nombre: 'Nómina',
        monto: 1500,
        tipo: TipoMovimiento.INGRESO,
        cuentaBaseId: 1,
        categoriaId: 2,
        fecha: '2026-11-02',
      };
      prismaServiceMock.movimiento.create.mockResolvedValue({
        movimientoId: 1,
        ...dto,
      });

      await service.createMovimiento(dto);

      expect(prismaServiceMock.movimiento.create).toHaveBeenCalledWith({
        data: { ...dto, fecha: new Date('2026-11-02') },
        include: { categoria: true },
      });
    });

    it('lanza BadRequestException si GASTO tiene cuentaDestinoId', async () => {
      const dto = {
        nombre: 'Gasto raro',
        monto: 100,
        tipo: TipoMovimiento.GASTO,
        cuentaBaseId: 1,
        categoriaId: 1,
        cuentaDestinoId: 2,
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

    it('lanza BadRequestException si un INGRESO paga una deuda', async () => {
      const dto = {
        nombre: 'Devolución',
        monto: 100,
        tipo: TipoMovimiento.INGRESO,
        cuentaBaseId: 1,
        categoriaId: 2,
        deudaId: 1,
      };

      await expect(service.createMovimiento(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaServiceMock.movimiento.create).not.toHaveBeenCalled();
    });
  });

  describe('getMovimientos', () => {
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
  });

  describe('updateMovimiento', () => {
    const existenteGasto = {
      movimientoId: 1,
      tipo: TipoMovimiento.GASTO,
      cuentaBaseId: 1,
      cuentaDestinoId: null,
      categoriaId: 1,
    };

    it('lanza BadRequestException si la nueva categoría es de otro tipo', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);

      await expect(
        service.updateMovimiento(1, { categoriaId: 2 }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaServiceMock.movimiento.update).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si la nueva categoría no existe', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);

      await expect(
        service.updateMovimiento(1, { categoriaId: 999 }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaServiceMock.movimiento.update).not.toHaveBeenCalled();
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

    it('actualiza una TRANSFERENCIA sin categoría', async () => {
      const transferencia = {
        movimientoId: 2,
        tipo: TipoMovimiento.TRANSFERENCIA,
        cuentaBaseId: 1,
        cuentaDestinoId: 2,
        categoriaId: null,
      };
      const actualizado = { ...transferencia, nombre: 'Nuevo nombre' };
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(transferencia);
      prismaServiceMock.movimiento.update.mockResolvedValue(actualizado);

      const resultado = await service.updateMovimiento(2, {
        nombre: 'Nuevo nombre',
      });

      expect(resultado).toEqual(actualizado);
    });

    it('convierte fecha YYYY-MM-DD a Date al actualizar', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);
      prismaServiceMock.movimiento.update.mockResolvedValue(existenteGasto);

      await service.updateMovimiento(1, { fecha: '2026-11-02' });

      expect(prismaServiceMock.movimiento.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { fecha: new Date('2026-11-02') },
        }),
      );
    });

    it('no toca fecha al actualizar si no se envía', async () => {
      prismaServiceMock.movimiento.findUnique.mockResolvedValue(existenteGasto);
      prismaServiceMock.movimiento.update.mockResolvedValue(existenteGasto);

      await service.updateMovimiento(1, { nombre: 'Nuevo nombre' });

      const { data } = prismaServiceMock.movimiento.update.mock.calls[0][0];
      expect(data.fecha).toBeUndefined();
    });
  });
});
