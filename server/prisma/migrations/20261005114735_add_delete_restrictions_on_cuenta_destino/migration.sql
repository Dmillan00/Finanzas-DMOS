-- DropForeignKey
ALTER TABLE "Movimiento" DROP CONSTRAINT "Movimiento_cuentaDestinoId_fkey";

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_cuentaDestinoId_fkey" FOREIGN KEY ("cuentaDestinoId") REFERENCES "Cuenta"("cuentaId") ON DELETE RESTRICT ON UPDATE CASCADE;
