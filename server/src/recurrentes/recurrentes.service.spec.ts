import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RecurrentesService } from './recurrentes.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  Periodicidad,
  TipoMovimientoCategoria,
} from '../generated/prisma/client.js';

describe('RecurrentesService', () => {
  let service: RecurrentesService;

  const prismaServiceMock = {
    recurrente: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    categoria: {
      findUnique: vi.fn(),
    },
    movimiento: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  const categoriaGasto = {
    categoriaId: 1,
    nombre: 'Gimnasio',
    tipo: TipoMovimientoCategoria.GASTO,
  };
  const categoriaIngreso = {
    categoriaId: 2,
    nombre: 'Nomina',
    tipo: TipoMovimientoCategoria.INGRESO,
  };

  const recurrenteBase = {
    recurrenteId: 1,
    nombre: 'Gimnasio',
    monto: 29.99,
    tipo: TipoMovimientoCategoria.GASTO,
    periodicidad: Periodicidad.MENSUAL,
    proximaFecha: new Date(Date.UTC(2026, 0, 31)),
    esSuscripcion: false,
    deudaId: 5,
    cuentaId: 1,
    categoriaId: 1,
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

    // La transacción en forma de array: resuelve las operaciones en orden
    prismaServiceMock.$transaction.mockImplementation((ops: unknown[]) =>
      Promise.all(ops),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurrentesService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<RecurrentesService>(RecurrentesService);
  });

  describe('create', () => {
    const dto = {
      nombre: 'Gimnasio',
      monto: 29.99,
      periodicidad: Periodicidad.MENSUAL,
      proximaFecha: '2026-12-05',
      cuentaId: 1,
    };

    it('lanza BadRequestException si el tipo no coincide con la categoría', async () => {
      await expect(
        service.create({
          ...dto,
          tipo: TipoMovimientoCategoria.INGRESO,
          categoriaId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaServiceMock.recurrente.create).not.toHaveBeenCalled();
    });

    it('lanza BadRequestException si un INGRESO tiene deuda', async () => {
      await expect(
        service.create({
          ...dto,
          tipo: TipoMovimientoCategoria.INGRESO,
          categoriaId: 2,
          deudaId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prismaServiceMock.recurrente.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('sin categoriaId ni deudaId en el PATCH, conserva los de la BD', async () => {
      prismaServiceMock.recurrente.findUnique.mockResolvedValue(recurrenteBase);
      prismaServiceMock.recurrente.update.mockResolvedValue(recurrenteBase);

      await service.update(1, { monto: 32.5 });

      expect(prismaServiceMock.categoria.findUnique).toHaveBeenCalledWith({
        where: { categoriaId: recurrenteBase.categoriaId },
      });
      expect(prismaServiceMock.recurrente.update).toHaveBeenCalledWith({
        where: { recurrenteId: 1 },
        data: { monto: 32.5, proximaFecha: undefined },
        include: { categoria: true },
      });
    });
  });

  describe('registrarPago', () => {
    it('MENSUAL del 31 de enero pasa al 28 de febrero', async () => {
      prismaServiceMock.recurrente.findUnique.mockResolvedValue(recurrenteBase);

      await service.registrarPago(1);

      expect(prismaServiceMock.movimiento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipo: TipoMovimientoCategoria.GASTO,
            cuentaBaseId: 1,
            deudaId: 5,
          }),
        }),
      );
      expect(prismaServiceMock.recurrente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { proximaFecha: new Date(Date.UTC(2026, 1, 28)) },
        }),
      );
    });

    it('ANUAL del 29 de febrero pasa al 28 de febrero del año siguiente', async () => {
      prismaServiceMock.recurrente.findUnique.mockResolvedValue({
        ...recurrenteBase,
        periodicidad: Periodicidad.ANUAL,
        proximaFecha: new Date(Date.UTC(2028, 1, 29)),
      });

      await service.registrarPago(1);

      expect(prismaServiceMock.recurrente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { proximaFecha: new Date(Date.UTC(2029, 1, 28)) },
        }),
      );
    });
  });
});
