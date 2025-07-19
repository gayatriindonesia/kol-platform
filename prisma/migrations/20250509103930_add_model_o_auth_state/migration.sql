/*
  Warnings:

  - A unique constraint covering the columns `[openId]` on the table `InfluencerPlatform` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "InfluencerPlatform" ADD COLUMN     "openId" TEXT;

-- CreateTable
CREATE TABLE "OAuthState" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "codeVerifier" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthState_state_key" ON "OAuthState"("state");

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerPlatform_openId_key" ON "InfluencerPlatform"("openId");
