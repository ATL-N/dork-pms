/*
  Warnings:

  - Added the required column `recordedById` to the `EggProductionRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EggProductionRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EggProductionRecord" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recordedById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "EggProductionRecord_flockId_date_idx" ON "EggProductionRecord"("flockId", "date");

-- AddForeignKey
ALTER TABLE "EggProductionRecord" ADD CONSTRAINT "EggProductionRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
