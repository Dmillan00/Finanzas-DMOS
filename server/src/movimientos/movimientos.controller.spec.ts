import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosController } from './movimientos.controller.js';
import { MovimientosService } from './movimientos.service.js';

describe('MovimientosController', () => {
  let controller: MovimientosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientosController],
      providers: [
        {
          provide: MovimientosService,
          useValue: {
            createMovimiento: vi.fn(),
            getMovimientos: vi.fn(),
            getMovimientoById: vi.fn(),
            updateMovimiento: vi.fn(),
            deleteMovimiento: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MovimientosController>(MovimientosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
