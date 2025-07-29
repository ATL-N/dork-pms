-- AlterTable
ALTER TABLE "Flock" ADD COLUMN "initialQuantity" INTEGER;

-- Populate existing rows
UPDATE "Flock" SET "initialQuantity" = "quantity";

-- AlterColumn
ALTER TABLE "Flock" ALTER COLUMN "initialQuantity" SET NOT NULL;
