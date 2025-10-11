-- AlterEnum
ALTER TYPE "ScheduleStatus" ADD VALUE 'IN_PROGRESS';

-- CreateTable
CREATE TABLE "DailyTaskRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "quantityUsed" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "healthTaskId" TEXT NOT NULL,
    "inventoryItemId" TEXT,

    CONSTRAINT "DailyTaskRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyTaskRecord_healthTaskId_idx" ON "DailyTaskRecord"("healthTaskId");

-- AddForeignKey
ALTER TABLE "DailyTaskRecord" ADD CONSTRAINT "DailyTaskRecord_healthTaskId_fkey" FOREIGN KEY ("healthTaskId") REFERENCES "HealthTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTaskRecord" ADD CONSTRAINT "DailyTaskRecord_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
