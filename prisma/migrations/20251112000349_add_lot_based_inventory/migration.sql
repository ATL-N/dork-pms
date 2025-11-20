/*
  Warnings:

  - You are about to drop the column `inventoryItemId` on the `DailyTaskRecord` table. All the data in the column will be lost.
  - You are about to drop the column `feedItemId` on the `FeedConsumption` table. All the data in the column will be lost.
  - You are about to drop the column `inventoryItemId` on the `HealthTask` table. All the data in the column will be lost.
  - You are about to drop the column `quantityUsed` on the `HealthTask` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `currentStock` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `minThreshold` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `supplier` on the `InventoryItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `InventoryItem` table. All the data in the column will be lost.
  - Added the required column `inventoryLotId` to the `FeedConsumption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DailyTaskRecord" DROP CONSTRAINT "DailyTaskRecord_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "FeedConsumption" DROP CONSTRAINT "FeedConsumption_feedItemId_fkey";

-- DropForeignKey
ALTER TABLE "HealthTask" DROP CONSTRAINT "HealthTask_inventoryItemId_fkey";

-- AlterTable
ALTER TABLE "DailyTaskRecord" DROP COLUMN "inventoryItemId",
ADD COLUMN     "inventoryLotId" TEXT;

-- AlterTable
ALTER TABLE "FeedConsumption" DROP COLUMN "feedItemId",
ADD COLUMN     "inventoryLotId" TEXT;

-- AlterTable
ALTER TABLE "HealthTask" DROP COLUMN "inventoryItemId",
DROP COLUMN "quantityUsed";

-- AlterTable
ALTER TABLE "InventoryItem" DROP COLUMN "createdAt",
DROP COLUMN "currentStock",
DROP COLUMN "minThreshold",
DROP COLUMN "price",
DROP COLUMN "supplier",
DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLot" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "supplier" TEXT,
    "initialQuantity" DOUBLE PRECISION NOT NULL,
    "remainingQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "unitConversionFactor" DOUBLE PRECISION DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "InventoryLot_inventoryItemId_idx" ON "InventoryLot"("inventoryItemId");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedConsumption" ADD CONSTRAINT "FeedConsumption_inventoryLotId_fkey" FOREIGN KEY ("inventoryLotId") REFERENCES "InventoryLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTaskRecord" ADD CONSTRAINT "DailyTaskRecord_inventoryLotId_fkey" FOREIGN KEY ("inventoryLotId") REFERENCES "InventoryLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
