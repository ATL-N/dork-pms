-- DropForeignKey
ALTER TABLE "FeedConsumption" DROP CONSTRAINT "FeedConsumption_feedItemId_fkey";

-- AddForeignKey
ALTER TABLE "FeedConsumption" ADD CONSTRAINT "FeedConsumption_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
