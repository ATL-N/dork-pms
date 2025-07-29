-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'MANAGER', 'WORKER');

-- CreateEnum
CREATE TYPE "FlockType" AS ENUM ('BROILER', 'LAYER', 'BREEDER');

-- CreateEnum
CREATE TYPE "FeedType" AS ENUM ('COMPLETE', 'INGREDIENT');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('SALES', 'PURCHASE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('FARMER', 'VET', 'ADMIN');

-- CreateEnum
CREATE TYPE "OwnerApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO', 'UNLIMITED');

-- CreateEnum
CREATE TYPE "VetRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VetAccessStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "userType" "UserType" NOT NULL DEFAULT 'FARMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "ownerApprovalStatus" "OwnerApprovalStatus",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "farmLimit" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmUser" (
    "farmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'WORKER',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmUser_pkey" PRIMARY KEY ("farmId","userId")
);

-- CreateTable
CREATE TABLE "VetFarmAccess" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "VetAccessStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "VetFarmAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VetAccessRequest" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,
    "status" "VetRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VetAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "contact" TEXT,
    "hireDate" TIMESTAMP(3),
    "salary" DOUBLE PRECISION,
    "performance" TEXT,
    "skills" TEXT[],

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "VeterinarianProfile" (
    "userId" TEXT NOT NULL,
    "specialization" TEXT,
    "licenseNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VeterinarianProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "VeterinarianRating" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raterId" TEXT NOT NULL,
    "veterinarianId" TEXT NOT NULL,

    CONSTRAINT "VeterinarianRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ConversationParticipant_pkey" PRIMARY KEY ("conversationId","userId")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadReceipt" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FlockType" NOT NULL,
    "breed" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Flock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "flockId" TEXT NOT NULL,

    CONSTRAINT "GrowthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EggProductionRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalEggs" INTEGER NOT NULL,
    "brokenEggs" INTEGER NOT NULL,
    "averageWeight" DOUBLE PRECISION,
    "flockId" TEXT NOT NULL,

    CONSTRAINT "EggProductionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MortalityRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cause" TEXT,
    "flockId" TEXT NOT NULL,

    CONSTRAINT "MortalityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccinationRecord" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vaccine" TEXT NOT NULL,
    "flockId" TEXT NOT NULL,

    CONSTRAINT "VaccinationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FeedType" NOT NULL,
    "category" TEXT,
    "supplier" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "location" TEXT,
    "batchNumber" TEXT,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "FeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedConsumption" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "flockId" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,

    CONSTRAINT "FeedConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedFormulation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "farmId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "FeedFormulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationIngredient" (
    "id" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "formulationId" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,

    CONSTRAINT "FormulationIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "currentStock" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "minThreshold" DOUBLE PRECISION,
    "supplier" TEXT,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "vendor" TEXT,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "customer" TEXT,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "type" "InvoiceType" NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "assignedToId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BirdResale" (
    "id" TEXT NOT NULL,
    "flockId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "recordedById" TEXT NOT NULL,

    CONSTRAINT "BirdResale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Farm_name_idx" ON "Farm"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VetFarmAccess_farmId_veterinarianId_key" ON "VetFarmAccess"("farmId", "veterinarianId");

-- CreateIndex
CREATE UNIQUE INDEX "VetAccessRequest_farmId_veterinarianId_key" ON "VetAccessRequest"("farmId", "veterinarianId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VeterinarianProfile_licenseNumber_key" ON "VeterinarianProfile"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReadReceipt_messageId_userId_key" ON "ReadReceipt"("messageId", "userId");

-- CreateIndex
CREATE INDEX "Flock_farmId_idx" ON "Flock"("farmId");

-- CreateIndex
CREATE INDEX "FeedItem_farmId_idx" ON "FeedItem"("farmId");

-- CreateIndex
CREATE INDEX "FeedFormulation_farmId_idx" ON "FeedFormulation"("farmId");

-- CreateIndex
CREATE INDEX "InventoryItem_farmId_idx" ON "InventoryItem"("farmId");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmUser" ADD CONSTRAINT "FarmUser_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmUser" ADD CONSTRAINT "FarmUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VetFarmAccess" ADD CONSTRAINT "VetFarmAccess_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VetFarmAccess" ADD CONSTRAINT "VetFarmAccess_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VetAccessRequest" ADD CONSTRAINT "VetAccessRequest_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VetAccessRequest" ADD CONSTRAINT "VetAccessRequest_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinarianProfile" ADD CONSTRAINT "VeterinarianProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinarianRating" ADD CONSTRAINT "VeterinarianRating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VeterinarianRating" ADD CONSTRAINT "VeterinarianRating_veterinarianId_fkey" FOREIGN KEY ("veterinarianId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadReceipt" ADD CONSTRAINT "ReadReceipt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadReceipt" ADD CONSTRAINT "ReadReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flock" ADD CONSTRAINT "Flock_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthRecord" ADD CONSTRAINT "GrowthRecord_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EggProductionRecord" ADD CONSTRAINT "EggProductionRecord_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MortalityRecord" ADD CONSTRAINT "MortalityRecord_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaccinationRecord" ADD CONSTRAINT "VaccinationRecord_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedItem" ADD CONSTRAINT "FeedItem_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedConsumption" ADD CONSTRAINT "FeedConsumption_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedConsumption" ADD CONSTRAINT "FeedConsumption_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "FeedItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedConsumption" ADD CONSTRAINT "FeedConsumption_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedFormulation" ADD CONSTRAINT "FeedFormulation_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedFormulation" ADD CONSTRAINT "FeedFormulation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationIngredient" ADD CONSTRAINT "FormulationIngredient_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "FeedFormulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationIngredient" ADD CONSTRAINT "FormulationIngredient_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "FeedItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirdResale" ADD CONSTRAINT "BirdResale_flockId_fkey" FOREIGN KEY ("flockId") REFERENCES "Flock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BirdResale" ADD CONSTRAINT "BirdResale_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
