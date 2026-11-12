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
      groupBy: vi.fn(),
    },
    categoria: {
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
    // Por defecto, sin categorías ni gastos (gastosPorCategoria devuelve [])
    prismaServiceMock.categoria.findMany.mockResolvedValue([]);
    prismaServiceMock.movimiento.groupBy.mockResolvedValue([]);
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

  describe('calcularAnio', () => {
    it('el 31 de diciembre a las 23:59 sigue en ese año', () => {
      const anio = service.calcularAnio(
        new Date(Date.UTC(2026, 11, 31, 23, 59)),
      );

      expect(anio).toEqual({
        desde: new Date(Date.UTC(2026, 0, 1)),
        hasta: new Date(Date.UTC(2027, 0, 1)),
      });
    });

    it('el 1 de enero a las 00:00 empieza el año nuevo', () => {
      const anio = service.calcularAnio(new Date(Date.UTC(2027, 0, 1)));

      expect(anio).toEqual({
        desde: new Date(Date.UTC(2027, 0, 1)),
        hasta: new Date(Date.UTC(2028, 0, 1)),
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

  describe('gastosPorCategoria', () => {
    // Hoy = 3 nov 2026 → periodo 27 oct – 27 nov y año 2026
    const desdePeriodo = new Date(Date.UTC(2026, 9, 27));
    const hastaPeriodo = new Date(Date.UTC(2026, 10, 27));
    const desdeAnio = new Date(Date.UTC(2026, 0, 1));
    const hastaAnio = new Date(Date.UTC(2027, 0, 1));

    const categorias = [
      { categoriaId: 1, nombre: 'Comida', limite: new Prisma.Decimal(100) },
      { categoriaId: 2, nombre: 'Ocio', limite: null },
      { categoriaId: 3, nombre: 'Ropa', limite: new Prisma.Decimal(50) },
    ];

    // Sumas por categoría según el rango pedido en el where (periodo o año)
    const mockGastos = (
      periodo: Record<number, string>,
      anio: Record<number, string> = {},
    ) => {
      prismaServiceMock.movimiento.groupBy.mockImplementation(
        ({ where }: { where: { fecha: { gte: Date } } }) => {
          const sumas =
            where.fecha.gte.getTime() === desdePeriodo.getTime()
              ? periodo
              : anio;
          return Promise.resolve(
            Object.entries(sumas).map(([id, monto]) => ({
              categoriaId: Number(id),
              _sum: { monto: new Prisma.Decimal(monto) },
            })),
          );
        },
      );
    };

    const buscar = (lista: { nombre: string }[], nombre: string) =>
      lista.find((item) => item.nombre === nombre);

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(Date.UTC(2026, 10, 3, 12)));
      mockTotales(null, null);
      prismaServiceMock.movimiento.findMany.mockResolvedValue([]);
      prismaServiceMock.categoria.findMany.mockResolvedValue(categorias);
    });

    it('pide las categorías de GASTO y suma sus gastos en el periodo y en el año', async () => {
      mockGastos({});

      await service.getDashboard();

      expect(prismaServiceMock.categoria.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tipo: 'GASTO' } }),
      );
      expect(prismaServiceMock.movimiento.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            tipo: 'GASTO',
            fecha: { gte: desdePeriodo, lt: hastaPeriodo },
          },
          _sum: { monto: true },
        }),
      );
      expect(prismaServiceMock.movimiento.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tipo: 'GASTO', fecha: { gte: desdeAnio, lt: hastaAnio } },
          _sum: { monto: true },
        }),
      );
    });

    it('si se pasa del límite calcula dentro, restante, exceso y porcentaje', async () => {
      mockGastos({ 1: '120' });

      const resultado = await service.getDashboard();

      expect(buscar(resultado.gastosPorCategoria.periodo, 'Comida')).toEqual({
        categoriaId: 1,
        nombre: 'Comida',
        importe: '120',
        limite: '100',
        dentro: '100',
        restante: '0',
        exceso: '20',
        porcentaje: '120',
      });
    });

    it('si no llega al límite el exceso es 0 y queda restante', async () => {
      mockGastos({ 3: '40' });

      const resultado = await service.getDashboard();

      expect(buscar(resultado.gastosPorCategoria.periodo, 'Ropa')).toEqual({
        categoriaId: 3,
        nombre: 'Ropa',
        importe: '40',
        limite: '50',
        dentro: '40',
        restante: '10',
        exceso: '0',
        porcentaje: '80',
      });
    });

    it('una categoría sin gastos sale con importe 0', async () => {
      mockGastos({});

      const resultado = await service.getDashboard();
      const periodo = resultado.gastosPorCategoria.periodo;

      expect(periodo).toHaveLength(3);
      expect(buscar(periodo, 'Ropa')).toMatchObject({
        importe: '0',
        dentro: '0',
        restante: '50',
        exceso: '0',
        porcentaje: '0',
      });
    });

    it('una categoría sin límite lleva los campos de límite a null', async () => {
      mockGastos({ 2: '30' });

      const resultado = await service.getDashboard();

      expect(buscar(resultado.gastosPorCategoria.periodo, 'Ocio')).toEqual({
        categoriaId: 2,
        nombre: 'Ocio',
        importe: '30',
        limite: null,
        dentro: null,
        restante: null,
        exceso: null,
        porcentaje: null,
      });
    });

    it('en el año no usa el límite', async () => {
      mockGastos({}, { 1: '500' });

      const resultado = await service.getDashboard();

      expect(buscar(resultado.gastosPorCategoria.anio, 'Comida')).toEqual({
        categoriaId: 1,
        nombre: 'Comida',
        importe: '500',
        limite: null,
        dentro: null,
        restante: null,
        exceso: null,
        porcentaje: null,
      });
    });

    it('ordena por importe de mayor a menor (como número, no como texto)', async () => {
      // Como texto, '9' iría antes que '120' y '40'
      mockGastos({ 1: '9', 2: '120', 3: '40' });

      const resultado = await service.getDashboard();

      expect(
        resultado.gastosPorCategoria.periodo.map((item) => item.nombre),
      ).toEqual(['Ocio', 'Ropa', 'Comida']);
    });
  });
});
