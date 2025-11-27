-- AlterTable
ALTER TABLE "bouquets" ALTER COLUMN "price_base" DROP NOT NULL,
ALTER COLUMN "extra_charge" DROP NOT NULL,
ALTER COLUMN "discount_percent" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL;

-- CreateTable
CREATE TABLE "bouquet_sizes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bouquet_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bouquet_size_translations" (
    "id" SERIAL NOT NULL,
    "size_id" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "bouquet_size_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bouquet_size_variants" (
    "id" SERIAL NOT NULL,
    "bouquet_id" INTEGER NOT NULL,
    "size_id" INTEGER NOT NULL,
    "flower_count" INTEGER NOT NULL,
    "price_base" DECIMAL(10,2) NOT NULL,
    "extra_charge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_percent" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL,
    "price_old" DECIMAL(10,2),

    CONSTRAINT "bouquet_size_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bouquet_sizes_name_key" ON "bouquet_sizes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "bouquet_size_translations_size_id_lang_key" ON "bouquet_size_translations"("size_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "bouquet_size_variants_bouquet_id_size_id_key" ON "bouquet_size_variants"("bouquet_id", "size_id");

-- AddForeignKey
ALTER TABLE "bouquet_size_translations" ADD CONSTRAINT "bouquet_size_translations_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "bouquet_sizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquet_size_variants" ADD CONSTRAINT "bouquet_size_variants_bouquet_id_fkey" FOREIGN KEY ("bouquet_id") REFERENCES "bouquets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquet_size_variants" ADD CONSTRAINT "bouquet_size_variants_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "bouquet_sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
