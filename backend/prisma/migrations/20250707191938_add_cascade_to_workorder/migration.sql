-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "method" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "received" REAL,
    "change" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workOrderId" TEXT NOT NULL,
    CONSTRAINT "Payment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("amount", "change", "createdAt", "id", "method", "received", "workOrderId") SELECT "amount", "change", "createdAt", "id", "method", "received", "workOrderId" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE TABLE "new_ServicesOnWorkOrders" (
    "workOrderId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    PRIMARY KEY ("workOrderId", "serviceId"),
    CONSTRAINT "ServicesOnWorkOrders_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServicesOnWorkOrders_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServicesOnWorkOrders" ("serviceId", "workOrderId") SELECT "serviceId", "workOrderId" FROM "ServicesOnWorkOrders";
DROP TABLE "ServicesOnWorkOrders";
ALTER TABLE "new_ServicesOnWorkOrders" RENAME TO "ServicesOnWorkOrders";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
