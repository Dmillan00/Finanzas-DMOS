import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CuentasService } from './cuentas.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

// Error de Prisma con el código que se quiera (P2025, P2003...)
const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('error', {
    code,
    clientVersion: '7.0.0',
  });

describe('CuentasService', () => {
  let service: CuentasService;

  const prismaServiceMock = {
    cuenta: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    movimiento: {
      aggregate: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuentasService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<CuentasService>(CuentasService);
  });

  describe('findOne', () => {
    it('lanza NotFoundException si la cuenta no existe', async () => {
      prismaServiceMock.cuenta.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalance', () => {
    it('suma ingresos y transferencias entrantes, y resta gastos y salientes', async () => {
      prismaServiceMock.cuenta.findUnique.mockResolvedValue({
        cuentaId: 1,
        nombre: 'Cuenta',
        saldoInicial: new Prisma.Decimal(100),
      });

      // Devuelve el total según el filtro con el que se consulta
      prismaServiceMock.movimiento.aggregate.mockImplementation(
        ({ where }: { where: { tipo: string; cuentaDestinoId?: number } }) => {
          let total = 0;
          if (where.tipo === 'INGRESO') total = 50;
          if (where.tipo === 'GASTO') total = 10;
          if (where.tipo === 'TRANSFERENCIA') {
            // Entrante (cuentaDestinoId) = 20; saliente (cuentaBaseId) = 30
            total = where.cuentaDestinoId ? 20 : 30;
          }
          return Promise.resolve({
            _sum: { monto: new Prisma.Decimal(total) },
          });
        },
      );

      const result = await service.getBalance(1);

      // 100 + 50 + 20 - 30 - 10
      expect(result.saldoActual.toNumber()).toBe(130);
    });

    it('usa solo el saldo inicial si no hay movimientos', async () => {
      prismaServiceMock.cuenta.findUnique.mockResolvedValue({
        cuentaId: 1,
        nombre: 'Cuenta',
        saldoInicial: new Prisma.Decimal(100),
      });
      // Sin movimientos, la suma llega como null
      prismaServiceMock.movimiento.aggregate.mockResolvedValue({
        _sum: { monto: null },
      });

      const result = await service.getBalance(1);

      expect(result.saldoActual.toNumber()).toBe(100);
    });
  });

  describe('update', () => {
    it('lanza NotFoundException si la cuenta no existe (P2025)', async () => {
      prismaServiceMock.cuenta.update.mockRejectedValue(prismaError('P2025'));

      await expect(service.update(1, { nombre: 'Nueva' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('lanza NotFoundException si la cuenta no existe (P2025)', async () => {
      prismaServiceMock.cuenta.delete.mockRejectedValue(prismaError('P2025'));

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si tiene relaciones (P2003)', async () => {
      prismaServiceMock.cuenta.delete.mockRejectedValue(prismaError('P2003'));

      await expect(service.delete(1)).rejects.toThrow(ConflictException);
    });
  });
});
