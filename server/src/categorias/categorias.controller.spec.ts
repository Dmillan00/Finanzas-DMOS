import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller.js';
import { CategoriasService } from './categorias.service.js';

describe('CategoriasController', () => {
  let controller: CategoriasController;

  const serviceMock = {
    createCategoria: vi.fn(),
    getCategorias: vi.fn(),
    getCategoria: vi.fn(),
    updateCategoria: vi.fn(),
    deleteCategoria: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriasController],
      providers: [{ provide: CategoriasService, useValue: serviceMock }],
    }).compile();

    controller = module.get<CategoriasController>(CategoriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createCategoria delega en el service', async () => {
    const dto = { nombre: 'Comida' };
    serviceMock.createCategoria.mockResolvedValue({ categoriaId: 1, ...dto });

    const resultado = await controller.createCategoria(dto);

    expect(serviceMock.createCategoria).toHaveBeenCalledWith(dto);
    expect(resultado).toEqual({ categoriaId: 1, nombre: 'Comida' });
  });

  it('getCategoria delega en el service con el id', async () => {
    serviceMock.getCategoria.mockResolvedValue({ categoriaId: 3 });

    await controller.getCategoria(3);

    expect(serviceMock.getCategoria).toHaveBeenCalledWith(3);
  });

  it('createCategoria relanza el error del service', async () => {
    const error = new Error('boom');
    serviceMock.createCategoria.mockRejectedValue(error);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(controller.createCategoria({ nombre: 'x' })).rejects.toBe(
      error,
    );
  });
});