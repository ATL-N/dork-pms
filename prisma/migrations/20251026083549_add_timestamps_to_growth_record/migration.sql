/*
  Warnings:

  - Added the required column `recordedById` to the `GrowthRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `GrowthRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GrowthRecord" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "recordedById" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "GrowthRecord" ADD CONSTRAINT "GrowthRecord_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
