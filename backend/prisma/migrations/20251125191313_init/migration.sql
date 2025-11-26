-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parent_id" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flowers" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "price_cost" DECIMAL(10,2) NOT NULL,
    "markup" DECIMAL(5,2) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "images" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flowers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flower_translations" (
    "id" SERIAL NOT NULL,
    "flower_id" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "flower_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "color" TEXT,
    "is_transparent" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT NOT NULL,
    "price_per_unit" DECIMAL(10,2) NOT NULL,
    "images" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_translations" (
    "id" SERIAL NOT NULL,
    "packaging_id" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "packaging_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bouquets" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "price_base" DECIMAL(10,2) NOT NULL,
    "extra_charge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount_percent" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL,
    "price_old" DECIMAL(10,2),
    "size" TEXT,
    "images" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bouquets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bouquet_translations" (
    "id" SERIAL NOT NULL,
    "bouquet_id" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "bouquet_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bouquet_flowers" (
    "id" SERIAL NOT NULL,
    "bouquet_id" INTEGER NOT NULL,
    "flower_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "bouquet_flowers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bouquet_materials" (
    "id" SERIAL NOT NULL,
    "bouquet_id" INTEGER NOT NULL,
    "packaging_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "bouquet_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "delivery_address" TEXT,
    "delivery_time" TEXT,
    "comment" TEXT,
    "payment_method" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "total_amount" DECIMAL(10,2) NOT NULL,
    "delivery_price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" INTEGER NOT NULL,
    "product_name_snapshot" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price_snapshot" DECIMAL(10,2) NOT NULL,
    "options" JSONB,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_lang_key" ON "category_translations"("category_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "flowers_sku_key" ON "flowers"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "flower_translations_flower_id_lang_key" ON "flower_translations"("flower_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_sku_key" ON "packaging"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_translations_packaging_id_lang_key" ON "packaging_translations"("packaging_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "bouquets_sku_key" ON "bouquets"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "bouquet_translations_bouquet_id_lang_key" ON "bouquet_translations"("bouquet_id", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowers" ADD CONSTRAINT "flowers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flower_translations" ADD CONSTRAINT "flower_translations_flower_id_fkey" FOREIGN KEY ("flower_id") REFERENCES "flowers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging" ADD CONSTRAINT "packaging_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_translations" ADD CONSTRAINT "packaging_translations_packaging_id_fkey" FOREIGN KEY ("packaging_id") REFERENCES "packaging"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquets" ADD CONSTRAINT "bouquets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquet_translations" ADD CONSTRAINT "bouquet_translations_bouquet_id_fkey" FOREIGN KEY ("bouquet_id") REFERENCES "bouquets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquet_flowers" ADD CONSTRAINT "bouquet_flowers_bouquet_id_fkey" FOREIGN KEY ("bouquet_id") REFERENCES "bouquets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquet_flowers" ADD CONSTRAINT "bouquet_flowers_flower_id_fkey" FOREIGN KEY ("flower_id") REFERENCES "flowers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquet_materials" ADD CONSTRAINT "bouquet_materials_bouquet_id_fkey" FOREIGN KEY ("bouquet_id") REFERENCES "bouquets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bouquet_materials" ADD CONSTRAINT "bouquet_materials_packaging_id_fkey" FOREIGN KEY ("packaging_id") REFERENCES "packaging"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "bouquets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
