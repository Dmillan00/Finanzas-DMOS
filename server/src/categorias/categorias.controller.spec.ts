import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller.js';
import { CategoriasService } from './categorias.service.js';

describe('CategoriasController', () => {
  let controller: CategoriasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [CategoriasService],
    }).compile();

    controller = module.get<CategoriasController>(CategoriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
