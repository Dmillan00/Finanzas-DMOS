-- AlterTable
ALTER TABLE "Movimiento" ADD COLUMN     "categoriaId" INTEGER;

-- CreateTable
CREATE TABLE "Categoria" (
    "categoriaId" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("categoriaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("categoriaId") ON DELETE RESTRICT ON UPDATE CASCADE;
