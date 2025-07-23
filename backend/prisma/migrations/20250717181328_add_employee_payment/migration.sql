/*
  Warnings:

  - You are about to drop the `ServicesOnWorkOrders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `employeeName` on the `CashMovement` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `CashMovement` table. All the data in the column will be lost.
  - You are about to drop the column `withdrawType` on the `CashMovement` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `EmployeePayment` table. All the data in the column will be lost.
  - You are about to drop the column `deductions` on the `EmployeePayment` table. All the data in the column will be lost.
  - You are about to drop the column `serviceCount` on the `EmployeePayment` table. All the data in the column will be lost.
  - You are about to drop the column `workOrderId` on the `EmployeePayment` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `LocalizaConfig` table. All the data in the column will be lost.
  - You are about to drop the column `percentage` on the `LocalizaConfig` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `LocalizaService` table. All the data in the column will be lost.
  - You are about to drop the column `localizaConfigId` on the `LocalizaService` table. All the data in the column will be lost.
  - You are about to drop the column `change` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `received` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `minStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `ProductMovement` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `ProductMovement` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `make` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `finishedAt` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `isLocaliza` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `EmployeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDeductions` to the `EmployeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmployeePayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `LocalizaConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `LocalizaConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ProductMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `ProductMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProductMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Made the column `vehicleId` on table `WorkOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ServicesOnWorkOrders";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ServicesOnOrders" (
    "workOrderId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    PRIMARY KEY ("workOrderId", "serviceId"),
    CONSTRAINT "ServicesOnOrders_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ServicesOnOrders_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CashMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'DEDUCTION',
    "amount" REAL NOT NULL,
    "description" TEXT,
    "employeeId" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paymentId" TEXT,
    CONSTRAINT "CashMovement_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CashMovement_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "EmployeePayment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CashMovement" ("amount", "createdAt", "employeeId", "id", "type", "updatedAt") SELECT "amount", "createdAt", "employeeId", "id", "type", "updatedAt" FROM "CashMovement";
DROP TABLE "CashMovement";
ALTER TABLE "new_CashMovement" RENAME TO "CashMovement";
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Customer" ("createdAt", "id", "name", "phone", "updatedAt") SELECT "createdAt", "id", "name", "phone", CURRENT_TIMESTAMP FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Employee" ("createdAt", "id", "name", "percentage", "updatedAt") SELECT "createdAt", "id", "name", "percentage", CURRENT_TIMESTAMP FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE TABLE "new_EmployeePayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "totalAmount" REAL NOT NULL,
    "totalDeductions" REAL NOT NULL,
    "finalAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmployeePayment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EmployeePayment" ("createdAt", "employeeId", "finalAmount", "id", "periodEnd", "periodStart", "updatedAt", "totalAmount", "totalDeductions") SELECT "createdAt", "employeeId", "finalAmount", "id", "periodEnd", "periodStart", CURRENT_TIMESTAMP, 0, 0 FROM "EmployeePayment";
DROP TABLE "EmployeePayment";
ALTER TABLE "new_EmployeePayment" RENAME TO "EmployeePayment";
CREATE TABLE "new_LocalizaConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_LocalizaConfig" ("createdAt", "id", "updatedAt", "name", "value") SELECT "createdAt", "id", CURRENT_TIMESTAMP, '', '' FROM "LocalizaConfig";
DROP TABLE "LocalizaConfig";
ALTER TABLE "new_LocalizaConfig" RENAME TO "LocalizaConfig";
CREATE TABLE "new_LocalizaService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_LocalizaService" ("createdAt", "id", "name", "price", "updatedAt") SELECT "createdAt", "id", "name", "price", CURRENT_TIMESTAMP FROM "LocalizaService";
DROP TABLE "LocalizaService";
ALTER TABLE "new_LocalizaService" RENAME TO "LocalizaService";
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workOrderId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "createdAt", "id", "method", "workOrderId", "updatedAt") SELECT "amount", "createdAt", "id", "method", "workOrderId", CURRENT_TIMESTAMP FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE UNIQUE INDEX "Payment_workOrderId_key" ON "Payment"("workOrderId");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("id", "name", "updatedAt", "price", "quantity") SELECT "id", "name", CURRENT_TIMESTAMP, 0, 0 FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_ProductMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "price" REAL NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductMovement" ("createdAt", "id", "productId", "type", "updatedAt", "quantity", "price") SELECT "createdAt", "id", "productId", "type", CURRENT_TIMESTAMP, 0, 0 FROM "ProductMovement";
DROP TABLE "ProductMovement";
ALTER TABLE "new_ProductMovement" RENAME TO "ProductMovement";
CREATE TABLE "new_Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Service" ("id", "name", "price", "updatedAt") SELECT "id", "name", "price", CURRENT_TIMESTAMP FROM "Service";
DROP TABLE "Service";
ALTER TABLE "new_Service" RENAME TO "Service";
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plate" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT,
    "customerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("color", "createdAt", "customerId", "id", "model", "plate", "updatedAt") SELECT "color", "createdAt", "customerId", "id", "model", "plate", CURRENT_TIMESTAMP FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");
CREATE TABLE "new_WorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "employeeId" TEXT,
    "customService" TEXT,
    "totalPrice" REAL NOT NULL,
    "employeePercentage" REAL,
    "status" TEXT NOT NULL DEFAULT 'AWAITING',
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentId" TEXT,
    CONSTRAINT "WorkOrder_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WorkOrder_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "EmployeePayment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WorkOrder" ("createdAt", "customService", "employeeId", "employeePercentage", "id", "isPaid", "status", "totalPrice", "vehicleId", "updatedAt") SELECT "createdAt", "customService", "employeeId", "employeePercentage", "id", "isPaid", "status", "totalPrice", "vehicleId", CURRENT_TIMESTAMP FROM "WorkOrder";
DROP TABLE "WorkOrder";
ALTER TABLE "new_WorkOrder" RENAME TO "WorkOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
