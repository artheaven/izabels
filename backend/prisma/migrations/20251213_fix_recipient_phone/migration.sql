-- Fix failed migration by resolving it manually
-- The migration 20251129140000_make_delivery_fields_optional already includes recipient_phone

-- Ensure the columns exist (idempotent)
ALTER TABLE "orders" ALTER COLUMN "delivery_date" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "delivery_time" DROP NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "recipient_phone" TEXT;

