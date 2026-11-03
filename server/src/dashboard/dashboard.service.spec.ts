import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

describe('DashboardService', () => {
  let service: DashboardService;

  const prismaServiceMock = {
    movimiento: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  };

  // Devuelve la suma según el tipo pedido en el where (no depende del orden de llamada)
  const mockTotales = (ingresos: string | null, gastos: string | null) => {
    prismaServiceMock.movimiento.aggregate.mockImplementation(
      ({ where }: { where: { tipo: string } }) =>
        Promise.resolve({
          _sum: {
            monto:
              where.tipo === 'INGRESO'
                ? ingresos && new Prisma.Decimal(ingresos)
                : gastos && new Prisma.Decimal(gastos),
          },
        }),
    );
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    // diaCobro se lee al instanciar el service: hay que fijarlo antes de compilar
    process.env.DIA_COBRO = '27';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calcularPeriodo', () => {
    const utc = (y: number, m: number, d: number) =>
      new Date(Date.UTC(y, m - 1, d));

    it('antes del día de cobro empieza en el mes anterior', () => {
      const periodo = service.calcularPeriodo(utc(2026, 11, 3), 27);

      expect(periodo).toEqual({
        desde: utc(2026, 10, 27),
        hasta: utc(2026, 11, 27),
      });
    });

    it('el mismo día de cobro empieza ese día', () => {
      const periodo = service.calcularPeriodo(utc(2026, 11, 27), 27);

      expect(periodo).toEqual({
        desde: utc(2026, 11, 27),
        hasta: utc(2026, 12, 27),
      });
    });

    it('después del día de cobro sigue en el mismo periodo', () => {
      const periodo = service.calcularPeriodo(utc(2026, 11, 30), 27);

      expect(periodo).toEqual({
        desde: utc(2026, 11, 27),
        hasta: utc(2026, 12, 27),
      });
    });

    it('en enero antes del cobro empieza en diciembre del año anterior', () => {
      const periodo = service.calcularPeriodo(utc(2026, 1, 15), 27);

      expect(periodo).toEqual({
        desde: utc(2025, 12, 27),
        hasta: utc(2026, 1, 27),
      });
    });

    it('en diciembre después del cobro termina en enero del año siguiente', () => {
      const periodo = service.calcularPeriodo(utc(2026, 12, 28), 27);

      expect(periodo).toEqual({
        desde: utc(2026, 12, 27),
        hasta: utc(2027, 1, 27),
      });
    });

    it('con día de cobro 1 el periodo es el mes natural', () => {
      const periodo = service.calcularPeriodo(utc(2026, 3, 1), 1);

      expect(periodo).toEqual({
        desde: utc(2026, 3, 1),
        hasta: utc(2026, 4, 1),
      });
    });
  });

  describe('getDashboard', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(Date.UTC(2026, 10, 3, 12)));
    });

    it('devuelve el periodo actual según DIA_COBRO', async () => {
      mockTotales(null, null);
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);

      const resultado = await service.getDashboard();

      expect(resultado.periodo).toEqual({
        desde: new Date(Date.UTC(2026, 9, 27)),
        hasta: new Date(Date.UTC(2026, 10, 27)),
      });
    });

    it('calcula ingresos, gastos y queda como string', async () => {
      mockTotales('1500.50', '200.25');
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);

      const resultado = await service.getDashboard();

      expect(resultado.totales).toEqual({
        ingresos: '1500.5',
        gastos: '200.25',
        queda: '1300.25',
      });
    });

    it('queda puede ser negativo', async () => {
      mockTotales('100', '250');
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);

      const resultado = await service.getDashboard();

      expect(resultado.totales.queda).toBe('-150');
    });

    it('sin movimientos devuelve totales a 0 y ultimos vacío', async () => {
      mockTotales(null, null);
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);

      const resultado = await service.getDashboard();

      expect(resultado.totales).toEqual({
        ingresos: '0',
        gastos: '0',
        queda: '0',
      });
      expect(resultado.ultimos).toEqual([]);
    });

    it('filtra los totales por tipo y por el periodo', async () => {
      mockTotales(null, null);
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);

      await service.getDashboard();

      const fecha = {
        gte: new Date(Date.UTC(2026, 9, 27)),
        lt: new Date(Date.UTC(2026, 10, 27)),
      };
      expect(prismaServiceMock.movimiento.aggregate).toHaveBeenCalledTimes(2);
      expect(prismaServiceMock.movimiento.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tipo: 'INGRESO', fecha } }),
      );
      expect(prismaServiceMock.movimiento.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tipo: 'GASTO', fecha } }),
      );
    });

    it('pide los 5 últimos GASTO/INGRESO sin filtro de periodo', async () => {
      mockTotales(null, null);
      const ultimos = [
        {
          movimientoId: 2,
          nombre: 'Nómina',
          monto: new Prisma.Decimal(1500),
          tipo: 'INGRESO',
          categoria: { nombre: 'Nómina' },
        },
      ];
      prismaServiceMock.movimiento.findMany.mockResolvedValue(ultimos);

      const resultado = await service.getDashboard();

      expect(resultado.ultimos).toEqual(ultimos);
      expect(prismaServiceMock.movimiento.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tipo: { in: ['GASTO', 'INGRESO'] } },
          orderBy: { movimientoId: 'desc' },
          take: 5,
        }),
      );
    });
  });
});
