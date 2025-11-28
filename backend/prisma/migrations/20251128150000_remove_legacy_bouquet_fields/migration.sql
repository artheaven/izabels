-- DropColumn
ALTER TABLE "bouquets" DROP COLUMN IF EXISTS "price_base";
ALTER TABLE "bouquets" DROP COLUMN IF EXISTS "extra_charge";
ALTER TABLE "bouquets" DROP COLUMN IF EXISTS "discount_percent";
ALTER TABLE "bouquets" DROP COLUMN IF EXISTS "price";
ALTER TABLE "bouquets" DROP COLUMN IF EXISTS "price_old";
ALTER TABLE "bouquets" DROP COLUMN IF EXISTS "size";

