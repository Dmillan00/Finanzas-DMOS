import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

describe('DashboardController', () => {
  let controller: DashboardController;

  const dashboardServiceMock = {
    getDashboard: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceMock },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('devuelve lo que calcula el service', async () => {
    const dashboard = {
      periodo: { desde: new Date(), hasta: new Date() },
      totales: { ingresos: '0', gastos: '0', queda: '0' },
      ultimos: [],
    };
    dashboardServiceMock.getDashboard.mockResolvedValue(dashboard);

    await expect(controller.getDashboard()).resolves.toEqual(dashboard);
  });

  it('propaga el error del service', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    dashboardServiceMock.getDashboard.mockRejectedValue(new Error('BD caída'));

    await expect(controller.getDashboard()).rejects.toThrow('BD caída');
  });
});
