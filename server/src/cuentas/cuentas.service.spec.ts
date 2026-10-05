import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CuentasService } from './cuentas.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

describe('CuentasService', () => {
  let service: CuentasService;

  const prismaServiceMock = {
    cuenta: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    movimiento: {
      aggregate: vi.fn(),
    },
  };

  const mockSinMovimientos = () => {
    prismaServiceMock.movimiento.aggregate.mockResolvedValue({
      _sum: { monto: null },
    });
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCuenta', () => {
    it('crea una cuenta y devuelve saldoActual', async () => {
      const dto = { nombre: 'Cuenta de prueba', saldoInicial: 1000 };
      const cuentaCreada = { cuentaId: 1, ...dto };

      prismaServiceMock.cuenta.create.mockResolvedValue(cuentaCreada);
      mockSinMovimientos();

      const resultado = await service.createCuenta(dto);

      expect(resultado).toEqual(
        expect.objectContaining({ cuentaId: 1, nombre: dto.nombre }),
      );
      expect(resultado.saldoActual.toNumber()).toBe(1000);
      expect(prismaServiceMock.cuenta.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('getCuentaById', () => {
    it('devuelve la cuenta si existe', async () => {
      const cuentaFake = {
        cuentaId: 1,
        nombre: 'Cuenta de prueba',
        saldoInicial: 1000,
      };
      prismaServiceMock.cuenta.findUnique.mockResolvedValue(cuentaFake);

      const resultado = await service.getCuentaById(1);

      expect(resultado).toEqual(cuentaFake);
    });

    it('lanza NotFoundException si no existe', async () => {
      prismaServiceMock.cuenta.findUnique.mockResolvedValue(null);

      await expect(service.getCuentaById(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateCuenta', () => {
    it('actualiza la cuenta y devuelve saldoActual', async () => {
      const dto = { nombre: 'Nuevo nombre' };
      const cuentaActualizada = {
        cuentaId: 1,
        nombre: 'Nuevo nombre',
        saldoInicial: 1000,
      };

      prismaServiceMock.cuenta.update.mockResolvedValue(cuentaActualizada);
      mockSinMovimientos();

      const resultado = await service.updateCuenta(1, dto);

      expect(resultado).toEqual(
        expect.objectContaining({ nombre: 'Nuevo nombre' }),
      );
      expect(prismaServiceMock.cuenta.update).toHaveBeenCalledWith({
        where: { cuentaId: 1 },
        data: dto,
      });
    });

    it('lanza NotFoundException si la cuenta no existe (P2025)', async () => {
      const errorP2025 = new Prisma.PrismaClientKnownRequestError('No existe', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prismaServiceMock.cuenta.update.mockRejectedValue(errorP2025);

      await expect(service.updateCuenta(99, { nombre: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteCuenta', () => {
    it('elimina la cuenta correctamente', async () => {
      const cuentaEliminada = { cuentaId: 1, nombre: 'Cuenta de prueba' };
      prismaServiceMock.cuenta.delete.mockResolvedValue(cuentaEliminada);

      const resultado = await service.deleteCuenta(1);

      expect(resultado).toEqual(cuentaEliminada);
    });

    it('lanza NotFoundException si no existe (P2025)', async () => {
      const errorP2025 = new Prisma.PrismaClientKnownRequestError('No existe', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prismaServiceMock.cuenta.delete.mockRejectedValue(errorP2025);

      await expect(service.deleteCuenta(99)).rejects.toThrow(NotFoundException);
    });

    it('lanza ConflictException si tiene relaciones (P2003)', async () => {
      const errorP2003 = new Prisma.PrismaClientKnownRequestError('FK', {
        code: 'P2003',
        clientVersion: '7.0.0',
      });
      prismaServiceMock.cuenta.delete.mockRejectedValue(errorP2003);

      await expect(service.deleteCuenta(1)).rejects.toThrow(ConflictException);
    });
  });
});
