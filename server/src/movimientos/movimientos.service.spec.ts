import { Test, TestingModule } from '@nestjs/testing';
import { MovimientosService } from './movimientos.service';

describe('MovimientosService', () => {
  let service: MovimientosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovimientosService],
    }).compile();

    service = module.get<MovimientosService>(MovimientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
