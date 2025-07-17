/*
  Warnings:

  - A unique constraint covering the columns `[name,type]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Service_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_type_key" ON "Service"("name", "type");
