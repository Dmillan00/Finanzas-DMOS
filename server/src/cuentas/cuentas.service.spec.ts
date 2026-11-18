import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CuentasService } from './cuentas.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

describe('CuentasService', () => {
  let service: CuentasService;

  const prismaServiceMock = {
    cuenta: {
      delete: vi.fn(),
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

  describe('deleteCuenta', () => {
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
