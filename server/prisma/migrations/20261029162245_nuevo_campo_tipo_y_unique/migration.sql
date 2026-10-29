/*
  Warnings:

  - A unique constraint covering the columns `[nombre,tipo]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tipo` to the `Categoria` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoMovimientoCategoria" AS ENUM ('INGRESO', 'GASTO');

-- DropIndex
DROP INDEX "Categoria_nombre_key";

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "tipo" "TipoMovimientoCategoria" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_tipo_key" ON "Categoria"("nombre", "tipo");
