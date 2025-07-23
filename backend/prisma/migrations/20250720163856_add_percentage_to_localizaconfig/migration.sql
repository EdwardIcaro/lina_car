-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LocalizaConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Padrão',
    "value" TEXT NOT NULL DEFAULT 'default',
    "percentage" REAL NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LocalizaConfig" ("createdAt", "id", "name", "updatedAt", "value") SELECT "createdAt", "id", "name", "updatedAt", "value" FROM "LocalizaConfig";
DROP TABLE "LocalizaConfig";
ALTER TABLE "new_LocalizaConfig" RENAME TO "LocalizaConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
