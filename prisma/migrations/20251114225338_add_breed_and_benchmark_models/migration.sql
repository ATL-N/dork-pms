-- CreateTable
CREATE TABLE "Breed" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Breed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardBenchmark" (
    "id" SERIAL NOT NULL,
    "breedId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "expectedBodyWeight" DOUBLE PRECISION,
    "expectedFeedIntake" DOUBLE PRECISION,
    "expectedEggProductionRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandardBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Breed_name_key" ON "Breed"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StandardBenchmark_breedId_week_key" ON "StandardBenchmark"("breedId", "week");

-- AddForeignKey
ALTER TABLE "StandardBenchmark" ADD CONSTRAINT "StandardBenchmark_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "Breed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
