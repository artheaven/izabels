-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('SALE', 'PREORDER');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "order_type" "OrderType" NOT NULL DEFAULT 'PREORDER';
