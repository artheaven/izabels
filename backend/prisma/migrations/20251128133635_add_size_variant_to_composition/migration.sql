/*
  Warnings:

  - Added the required column `updated_at` to the `bouquet_size_variants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "bouquet_flowers" ADD COLUMN     "size_variant_id" INTEGER;

-- AlterTable
ALTER TABLE "bouquet_materials" ADD COLUMN     "size_variant_id" INTEGER;

-- AlterTable
ALTER TABLE "bouquet_size_variants" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "bouquet_flowers" ADD CONSTRAINT "bouquet_flowers_size_variant_id_fkey" FOREIGN KEY ("size_variant_id") REFERENCES "bouquet_size_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquet_materials" ADD CONSTRAINT "bouquet_materials_size_variant_id_fkey" FOREIGN KEY ("size_variant_id") REFERENCES "bouquet_size_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
