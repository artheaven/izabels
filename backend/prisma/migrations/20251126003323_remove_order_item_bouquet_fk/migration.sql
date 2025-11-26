-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_item_id_fkey";

-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "item_id" DROP NOT NULL;
