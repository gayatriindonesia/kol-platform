/*
  Warnings:

  - Added the required column `provider` to the `OAuthState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InfluencerPlatform" ADD COLUMN     "igAccountType" TEXT,
ADD COLUMN     "igBusinessAccountId" TEXT,
ADD COLUMN     "igEngagementRate" DOUBLE PRECISION,
ADD COLUMN     "igMediaCount" INTEGER,
ADD COLUMN     "igUserId" TEXT;

-- AlterTable
ALTER TABLE "OAuthState" ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "redirectUri" TEXT;

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OAuthState_provider_userId_idx" ON "OAuthState"("provider", "userId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
