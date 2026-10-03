-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'GASTO', 'TRANSFERENCIA');

-- CreateTable
CREATE TABLE "Cuenta" (
    "cuentaId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "saldoInicial" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "Cuenta_pkey" PRIMARY KEY ("cuentaId")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "movimientoId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT,
    "cuentaBaseId" INTEGER NOT NULL,
    "cuentaDestinoId" INTEGER,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("movimientoId")
);

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_cuentaBaseId_fkey" FOREIGN KEY ("cuentaBaseId") REFERENCES "Cuenta"("cuentaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "Cuenta"("cuentaId") ON DELETE SET NULL ON UPDATE CASCADE;
