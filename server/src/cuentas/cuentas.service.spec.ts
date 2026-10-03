import { Test, TestingModule } from '@nestjs/testing';
import { CuentasService } from './cuentas.service';

describe('CuentasService', () => {
  let service: CuentasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuentasService],
    }).compile();

    service = module.get<CuentasService>(CuentasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
