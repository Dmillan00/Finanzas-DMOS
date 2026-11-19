-- CreateEnum
CREATE TYPE "Periodicidad" AS ENUM ('MENSUAL', 'ANUAL');

-- AlterTable
ALTER TABLE "Movimiento" ADD COLUMN     "deudaId" INTEGER;

-- CreateTable
CREATE TABLE "Recurrente" (
    "recurrenteId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "tipo" "TipoMovimientoCategoria" NOT NULL,
    "periodicidad" "Periodicidad" NOT NULL,
    "proximaFecha" TIMESTAMP(3) NOT NULL,
    "esSuscripcion" BOOLEAN NOT NULL DEFAULT false,
    "deudaId" INTEGER,
    "cuentaId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "Recurrente_pkey" PRIMARY KEY ("recurrenteId")
);

-- CreateTable
CREATE TABLE "Deuda" (
    "deudaId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "montoTotal" DECIMAL(10,2) NOT NULL,
    "nota" TEXT,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("deudaId")
);

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("deudaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("categoriaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "Cuenta"("cuentaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recurrente" ADD CONSTRAINT "Recurrente_deudaId_fkey" FOREIGN KEY ("deudaId") REFERENCES "Deuda"("deudaId") ON DELETE RESTRICT ON UPDATE CASCADE;
