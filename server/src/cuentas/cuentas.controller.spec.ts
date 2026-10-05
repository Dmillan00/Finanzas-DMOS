import { Test, TestingModule } from '@nestjs/testing';
import { CuentasController } from './cuentas.controller.js';
import { CuentasService } from './cuentas.service.js';

describe('CuentasController', () => {
  let controller: CuentasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentasController],
      providers: [
        {
          provide: CuentasService,
          useValue: {
            createCuenta: vi.fn(),
            getCuentas: vi.fn(),
            calcularSaldoTotal: vi.fn(),
            updateCuenta: vi.fn(),
            deleteCuenta: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CuentasController>(CuentasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
