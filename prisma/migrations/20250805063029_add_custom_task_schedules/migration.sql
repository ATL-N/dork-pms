/*
  Warnings:

  - The values [IN_PROGRESS] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assignedDate` on the `Task` table. All the data in the column will be lost.
  - Added the required column `flockId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Made the column `dueDate` on table `Task` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED');
ALTER TABLE "Task" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Task" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
ALTER TABLE "Task" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedToId_fkey";

-- AlterTable
ALTER TABLE "Farm" ADD COLUMN     "useCustomSchedule" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assignedDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "flockId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "dueDate" SET NOT NULL,
ALTER COLUMN "assignedToId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CustomTaskSchedule" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "taskName" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "times" TEXT[],
    "applyToAllFarms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTaskSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTemplate" (
    "id" TEXT NOT NULL,
    "birdType" "FlockType" NOT NULL,
    "ageStartDays" INTEGER NOT NULL,
    "ageEndDays" INTEGER NOT NULL,
    "taskName" TEXT NOT NULL,
    "taskDescription" TEXT,
    "timesPerDay" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomTaskSchedule_farmId_taskName_key" ON "CustomTaskSchedule"("farmId", "taskName");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTemplate_birdType_ageStartDays_ageEndDays_taskName_key" ON "TaskTemplate"("birdType", "ageStartDays", "ageEndDays", "taskName");

-- CreateIndex
CREATE INDEX "Task_farmId_flockId_dueDate_idx" ON "Task"("farmId", "flockId", "dueDate");

-- AddForeignKey
ALTER TABLE "CustomTaskSchedule" ADD CONSTRAINT "CustomTaskSchedule_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
