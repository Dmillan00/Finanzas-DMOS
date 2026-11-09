import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;

  const prismaServiceMock = {
    $queryRaw: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('sistema', () => {
    it('devuelve el nombre de la BD conectada', async () => {
      prismaServiceMock.$queryRaw.mockResolvedValue([
        { current_database: 'finanzas_main' },
      ]);

      await expect(appController.getSistema()).resolves.toEqual({
        bd: 'finanzas_main',
      });
      expect(prismaServiceMock.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('propaga el error si Postgres falla', async () => {
      prismaServiceMock.$queryRaw.mockRejectedValue(new Error('BD caída'));

      await expect(appController.getSistema()).rejects.toThrow('BD caída');
    });
  });
});
