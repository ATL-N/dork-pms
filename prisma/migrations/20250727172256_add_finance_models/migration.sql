/*
  Warnings:

  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Revenue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `invoiceNumber` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'REVENUE');

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_farmId_fkey";

-- DropForeignKey
ALTER TABLE "Revenue" DROP CONSTRAINT "Revenue_farmId_fkey";

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "customer" TEXT,
ADD COLUMN     "invoiceNumber" TEXT NOT NULL,
ADD COLUMN     "vendor" TEXT;

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "Revenue";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "vendor" TEXT,
    "customer" TEXT,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggSale" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "customer" TEXT,
    "notes" TEXT,
    "recordedById" TEXT NOT NULL,
    "transactionId" TEXT,

    CONSTRAINT "EggSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EggSale_transactionId_key" ON "EggSale"("transactionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggSale" ADD CONSTRAINT "EggSale_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggSale" ADD CONSTRAINT "EggSale_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggSale" ADD CONSTRAINT "EggSale_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
