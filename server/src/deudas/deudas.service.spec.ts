import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DeudasService } from './deudas.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

describe('DeudasService', () => {
  let service: DeudasService;

  const prismaServiceMock = {
    deuda: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    movimiento: {
      aggregate: vi.fn(),
    },
  };

  const deuda = {
    deudaId: 1,
    nombre: 'Préstamo coche',
    montoTotal: new Prisma.Decimal(3000),
    nota: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeudasService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<DeudasService>(DeudasService);
  });

  describe('findOne', () => {
    it('pendiente = montoTotal − suma de pagos', async () => {
      prismaServiceMock.deuda.findUnique.mockResolvedValue(deuda);
      prismaServiceMock.movimiento.aggregate.mockResolvedValue({
        _sum: { monto: new Prisma.Decimal(250) },
      });

      const resultado = await service.findOne(1);

      expect(resultado.pagado.toString()).toBe('250');
      expect(resultado.pendiente.toString()).toBe('2750');
    });

    it('sin pagos, pendiente = montoTotal', async () => {
      prismaServiceMock.deuda.findUnique.mockResolvedValue(deuda);
      prismaServiceMock.movimiento.aggregate.mockResolvedValue({
        _sum: { monto: null },
      });

      const resultado = await service.findOne(1);

      expect(resultado.pagado.toString()).toBe('0');
      expect(resultado.pendiente.toString()).toBe('3000');
    });
  });

  describe('delete', () => {
    it('lanza ConflictException si tiene pagos o recurrentes (P2003)', async () => {
      const errorP2003 = new Prisma.PrismaClientKnownRequestError('FK', {
        code: 'P2003',
        clientVersion: '7.0.0',
      });
      prismaServiceMock.deuda.delete.mockRejectedValue(errorP2003);

      await expect(service.delete(1)).rejects.toThrow(ConflictException);
    });
  });
});
