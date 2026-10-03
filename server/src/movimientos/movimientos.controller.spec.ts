import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosController } from './movimientos.controller';

describe('MovimientosController', () => {
  let controller: MovimientosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovimientosController],
    }).compile();

    controller = module.get<MovimientosController>(MovimientosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
