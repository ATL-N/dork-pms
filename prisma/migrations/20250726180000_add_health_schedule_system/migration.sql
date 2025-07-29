-- CreateTable
CREATE TABLE "HealthScheduleTemplate" (
    "id" TEXT NOT NULL,
    "birdType" "FlockType" NOT NULL,
    "day" INTEGER NOT NULL,
    "taskName" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "HealthScheduleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthTask" (
    "id" TEXT NOT NULL,
    "flockId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "inventoryItemId" TEXT,
    "quantityUsed" DOUBLE PRECISION,

    CONSTRAINT "HealthTask_pkey" PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE "VaccinationRecord";
DROP TABLE "VaccinationSchedule";

-- CreateIndex
CREATE UNIQUE INDEX "HealthScheduleTemplate_birdType_day_taskName_key" ON "HealthScheduleTemplate"("birdType", "day", "taskName");

-- CreateIndex
CREATE INDEX "HealthTask_flockId_scheduledDate_idx" ON "HealthTask"("flockId", "scheduledDate");

-- AddForeignKey
ALTER TABLE "HealthTask" ADD CONSTRAINT "HealthTask_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthTask" ADD CONSTRAINT "HealthTask_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
