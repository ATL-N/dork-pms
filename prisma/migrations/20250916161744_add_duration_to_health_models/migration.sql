-- AlterTable
ALTER TABLE "HealthScheduleTemplate" ADD COLUMN     "durationInDays" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "HealthTask" ADD COLUMN     "durationInDays" INTEGER NOT NULL DEFAULT 1;
