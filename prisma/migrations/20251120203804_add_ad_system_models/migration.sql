-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "callToActionText" TEXT NOT NULL,
    "callToActionUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 10,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAdInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "timeOfDay" TEXT NOT NULL,

    CONSTRAINT "UserAdInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAdInteraction_userId_viewedAt_idx" ON "UserAdInteraction"("userId", "viewedAt");

-- AddForeignKey
ALTER TABLE "UserAdInteraction" ADD CONSTRAINT "UserAdInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdInteraction" ADD CONSTRAINT "UserAdInteraction_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
