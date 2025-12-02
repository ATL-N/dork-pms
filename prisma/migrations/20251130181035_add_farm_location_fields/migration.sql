-- AlterTable
ALTER TABLE "Farm" ADD COLUMN     "gps_address" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Farm_latitude_longitude_idx" ON "Farm"("latitude", "longitude");
