/*
  Warnings:

  - You are about to drop the column `expires` on the `PasswordResetToken` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purpose` to the `PasswordResetToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('PASSWORD_RESET', 'PASSWORD_CHANGE');

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP COLUMN "expires",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "purpose" "OtpPurpose" NOT NULL;

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_purpose_idx" ON "PasswordResetToken"("userId", "purpose");
