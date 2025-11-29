-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "delivery_date" DROP NOT NULL;
ALTER TABLE "orders" ALTER COLUMN "delivery_time" DROP NOT NULL;
ALTER TABLE "orders" ADD COLUMN "recipient_phone" TEXT;
