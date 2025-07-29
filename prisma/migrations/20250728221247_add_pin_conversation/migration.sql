-- CreateTable
CREATE TABLE "PinnedConversation" (
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "pinnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PinnedConversation_pkey" PRIMARY KEY ("userId","conversationId")
);

-- AddForeignKey
ALTER TABLE "PinnedConversation" ADD CONSTRAINT "PinnedConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PinnedConversation" ADD CONSTRAINT "PinnedConversation_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
