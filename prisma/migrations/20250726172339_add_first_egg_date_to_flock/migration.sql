-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED');

-- AlterTable
ALTER TABLE "Flock" ADD COLUMN     "firstEggDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "VaccinationSchedule" (
    "id" TEXT NOT NULL,
    "flockId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccinationSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VaccinationSchedule" ADD CONSTRAINT "VaccinationSchedule_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
