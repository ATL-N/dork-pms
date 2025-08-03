-- CreateEnum
CREATE TYPE "VetApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "VeterinarianProfile" ADD COLUMN     "approvalStatus" "VetApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "qualificationUrl" TEXT,
ADD COLUMN     "yearsExperience" INTEGER;
