-- CreateEnum
CREATE TYPE "MOUStatus" AS ENUM ('DRAFT', 'PENDING_BRAND', 'PENDING_INFLUENCER', 'PENDING_ADMIN', 'APPROVED', 'REJECTED', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'AMENDED');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "canStartWithoutMOU" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mouRequired" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "CampaignInvitation" ADD COLUMN     "mouCreatedAt" TIMESTAMP(3),
ADD COLUMN     "mouCreatedBy" TEXT,
ADD COLUMN     "mouCreationRequested" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MOU" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "mouNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "brandName" TEXT NOT NULL,
    "brandAddress" TEXT,
    "brandRepresentative" TEXT NOT NULL,
    "brandEmail" TEXT NOT NULL,
    "brandPhone" TEXT,
    "influencerName" TEXT NOT NULL,
    "influencerAddress" TEXT,
    "influencerEmail" TEXT NOT NULL,
    "influencerPhone" TEXT,
    "influencerTaxId" TEXT,
    "campaignObjective" TEXT NOT NULL,
    "campaignScope" TEXT NOT NULL,
    "deliverableDetails" JSONB NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "totalBudget" INTEGER NOT NULL,
    "paymentTerms" TEXT NOT NULL,
    "paymentSchedule" JSONB,
    "termsAndConditions" TEXT NOT NULL,
    "cancellationClause" TEXT,
    "confidentialityClause" TEXT,
    "intellectualProperty" TEXT,
    "status" "MOUStatus" NOT NULL DEFAULT 'DRAFT',
    "brandApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "brandApprovedAt" TIMESTAMP(3),
    "brandApprovedBy" TEXT,
    "brandRejectionReason" TEXT,
    "influencerApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "influencerApprovedAt" TIMESTAMP(3),
    "influencerApprovedBy" TEXT,
    "influencerRejectionReason" TEXT,
    "adminApprovalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "adminApprovedAt" TIMESTAMP(3),
    "adminApprovedBy" TEXT,
    "adminRejectionReason" TEXT,
    "documentPath" TEXT,
    "digitalSignature" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentMOUId" TEXT,
    "revisionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "MOU_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MOUApproval" (
    "id" TEXT NOT NULL,
    "mouId" TEXT NOT NULL,
    "approverRole" "UserRole" NOT NULL,
    "approverUserId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL,
    "comments" TEXT,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MOUApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MOUAmendment" (
    "id" TEXT NOT NULL,
    "mouId" TEXT NOT NULL,
    "amendmentNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "changedFields" JSONB NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "status" "MOUStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "MOUAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MOUTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "titleTemplate" TEXT NOT NULL,
    "termsAndConditions" TEXT NOT NULL,
    "cancellationClause" TEXT NOT NULL,
    "confidentialityClause" TEXT NOT NULL,
    "intellectualProperty" TEXT NOT NULL,
    "paymentTermsTemplate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "minimumBudget" INTEGER,
    "applicablePlatforms" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "MOUTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MOU_campaignId_key" ON "MOU"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "MOU_mouNumber_key" ON "MOU"("mouNumber");

-- CreateIndex
CREATE INDEX "MOU_status_createdAt_idx" ON "MOU"("status", "createdAt");

-- CreateIndex
CREATE INDEX "MOU_campaignId_idx" ON "MOU"("campaignId");

-- CreateIndex
CREATE INDEX "MOUApproval_mouId_approverRole_idx" ON "MOUApproval"("mouId", "approverRole");

-- CreateIndex
CREATE UNIQUE INDEX "MOUAmendment_mouId_amendmentNumber_key" ON "MOUAmendment"("mouId", "amendmentNumber");

-- AddForeignKey
ALTER TABLE "MOU" ADD CONSTRAINT "MOU_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOU" ADD CONSTRAINT "MOU_parentMOUId_fkey" FOREIGN KEY ("parentMOUId") REFERENCES "MOU"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOUApproval" ADD CONSTRAINT "MOUApproval_mouId_fkey" FOREIGN KEY ("mouId") REFERENCES "MOU"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOUAmendment" ADD CONSTRAINT "MOUAmendment_mouId_fkey" FOREIGN KEY ("mouId") REFERENCES "MOU"("id") ON DELETE CASCADE ON UPDATE CASCADE;
