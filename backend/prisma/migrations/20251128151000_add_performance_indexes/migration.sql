-- CreateIndex для оптимизации запросов

-- Bouquet indexes
CREATE INDEX IF NOT EXISTS "bouquets_category_id_idx" ON "bouquets"("category_id");
CREATE INDEX IF NOT EXISTS "bouquets_is_active_idx" ON "bouquets"("is_active");
CREATE INDEX IF NOT EXISTS "bouquets_is_featured_idx" ON "bouquets"("is_featured");
CREATE INDEX IF NOT EXISTS "bouquets_created_at_idx" ON "bouquets"("created_at");

-- BouquetSizeVariant indexes
CREATE INDEX IF NOT EXISTS "bouquet_size_variants_bouquet_id_idx" ON "bouquet_size_variants"("bouquet_id");
CREATE INDEX IF NOT EXISTS "bouquet_size_variants_size_id_idx" ON "bouquet_size_variants"("size_id");
CREATE INDEX IF NOT EXISTS "bouquet_size_variants_price_idx" ON "bouquet_size_variants"("price");

-- BouquetFlower indexes
CREATE INDEX IF NOT EXISTS "bouquet_flowers_bouquet_id_idx" ON "bouquet_flowers"("bouquet_id");
CREATE INDEX IF NOT EXISTS "bouquet_flowers_size_variant_id_idx" ON "bouquet_flowers"("size_variant_id");
CREATE INDEX IF NOT EXISTS "bouquet_flowers_flower_id_idx" ON "bouquet_flowers"("flower_id");

-- BouquetMaterial indexes
CREATE INDEX IF NOT EXISTS "bouquet_materials_bouquet_id_idx" ON "bouquet_materials"("bouquet_id");
CREATE INDEX IF NOT EXISTS "bouquet_materials_size_variant_id_idx" ON "bouquet_materials"("size_variant_id");
CREATE INDEX IF NOT EXISTS "bouquet_materials_packaging_id_idx" ON "bouquet_materials"("packaging_id");

