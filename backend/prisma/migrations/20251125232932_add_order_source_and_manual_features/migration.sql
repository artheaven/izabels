-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('WEBSITE', 'STORE', 'INSTAGRAM', 'FACEBOOK');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "source" "OrderSource" NOT NULL DEFAULT 'WEBSITE';
