import { Test, TestingModule } from '@nestjs/testing';
import { CuentasController } from './cuentas.controller';

describe('CuentasController', () => {
  let controller: CuentasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentasController],
    }).compile();

    controller = module.get<CuentasController>(CuentasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
