/*
  Warnings:

  - A unique constraint covering the columns `[healthTaskId,date]` on the table `DailyTaskRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DailyTaskRecord_healthTaskId_date_key" ON "DailyTaskRecord"("healthTaskId", "date");
