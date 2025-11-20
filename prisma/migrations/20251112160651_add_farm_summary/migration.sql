/*
  Warnings:

  - Made the column `inventoryLotId` on table `FeedConsumption` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FeedConsumption" ALTER COLUMN "inventoryLotId" SET NOT NULL;

-- CreateTable
CREATE TABLE "FarmSummary" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "totalEggsAvailable" INTEGER NOT NULL DEFAULT 0,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FarmSummary_farmId_key" ON "FarmSummary"("farmId");

-- AddForeignKey
ALTER TABLE "FarmSummary" ADD CONSTRAINT "FarmSummary_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
