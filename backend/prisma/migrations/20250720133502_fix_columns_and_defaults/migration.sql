/*
  Warnings:

  - You are about to drop the `EmployeePayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServicesOnOrders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `description` on the `CashMovement` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `CashMovement` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `CashMovement` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `LocalizaService` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ProductMovement` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ProductMovement` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `ProductMovement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ProductMovement` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `isPaid` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `WorkOrder` table. All the data in the column will be lost.
  - Made the column `phone` on table `Customer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `localizaConfigId` to the `LocalizaService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `make` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Made the column `color` on table `Vehicle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmployeePayment";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ServicesOnOrders";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CashMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME,
    "employeeId" TEXT,
    CONSTRAINT "CashMovement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CashMovement" ("amount", "createdAt", "employeeId", "id", "type", "updatedAt") SELECT "amount", "createdAt", "employeeId", "id", "type", "updatedAt" FROM "CashMovement";
DROP TABLE "CashMovement";
ALTER TABLE "new_CashMovement" RENAME TO "CashMovement";
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Customer" ("createdAt", "id", "name", "phone") SELECT "createdAt", "id", "name", "phone" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Employee" ("createdAt", "id", "name", "percentage") SELECT "createdAt", "id", "name", "percentage" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE TABLE "new_LocalizaConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Padrão',
    "value" TEXT NOT NULL DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LocalizaConfig" ("createdAt", "id", "name", "updatedAt", "value") SELECT "createdAt", "id", "name", "updatedAt", "value" FROM "LocalizaConfig";
DROP TABLE "LocalizaConfig";
ALTER TABLE "new_LocalizaConfig" RENAME TO "LocalizaConfig";
CREATE TABLE "new_LocalizaService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "localizaConfigId" TEXT NOT NULL,
    CONSTRAINT "LocalizaService_localizaConfigId_fkey" FOREIGN KEY ("localizaConfigId") REFERENCES "LocalizaConfig" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LocalizaService" ("createdAt", "id", "name", "price", "updatedAt") SELECT "createdAt", "id", "name", "price", "updatedAt" FROM "LocalizaService";
DROP TABLE "LocalizaService";
ALTER TABLE "new_LocalizaService" RENAME TO "LocalizaService";
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workOrderId" TEXT NOT NULL,
    CONSTRAINT "Payment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "id", "method", "workOrderId") SELECT "amount", "createdAt", "id", "method", "workOrderId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Product" ("id", "name") SELECT "id", "name" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_ProductMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductMovement" ("createdAt", "id", "productId", "type") SELECT "createdAt", "id", "productId", "type" FROM "ProductMovement";
DROP TABLE "ProductMovement";
ALTER TABLE "new_ProductMovement" RENAME TO "ProductMovement";
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "type" TEXT NOT NULL
);
INSERT INTO "new_Service" ("id", "name", "price") SELECT "id", "name", "price" FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE UNIQUE INDEX "Service_name_type_key" ON "Service"("name", "type");
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plate" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerId" TEXT NOT NULL,
    CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("color", "createdAt", "customerId", "id", "model", "plate") SELECT "color", "createdAt", "customerId", "id", "model", "plate" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");
CREATE TABLE "new_WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'AWAITING',
    "totalPrice" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customService" TEXT,
    "employeePercentage" REAL,
    "vehicleId" TEXT,
    "employeeId" TEXT,
    CONSTRAINT "WorkOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WorkOrder" ("createdAt", "customService", "employeeId", "employeePercentage", "id", "status", "totalPrice", "vehicleId") SELECT "createdAt", "customService", "employeeId", "employeePercentage", "id", "status", "totalPrice", "vehicleId" FROM "WorkOrder";
DROP TABLE "WorkOrder";
ALTER TABLE "new_WorkOrder" RENAME TO "WorkOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
