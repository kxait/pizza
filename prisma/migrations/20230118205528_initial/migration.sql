-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Inventory" (
    "name" TEXT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "qty" REAL NOT NULL,
    "unit" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "made_date_time" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "est_arrival_date_time" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "payment_type" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order_Product" (
    "product_id" INTEGER NOT NULL,
    "order_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,

    PRIMARY KEY ("product_id", "order_id"),
    CONSTRAINT "Order_Product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_Product_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product_Inventory" (
    "product_id" INTEGER NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "inventory_qty_required" REAL NOT NULL,

    PRIMARY KEY ("product_id", "inventory_id"),
    CONSTRAINT "Product_Inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_Inventory_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "Inventory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL
);
