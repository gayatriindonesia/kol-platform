/*
  Warnings:

  - You are about to drop the column `link_social` on the `Influencer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Influencer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `InfluencerPlatform` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Influencer" DROP COLUMN "link_social";

-- AlterTable
ALTER TABLE "InfluencerPlatform" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "followers" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastSynced" TIMESTAMP(3),
ADD COLUMN     "platformData" JSONB,
ADD COLUMN     "posts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_userId_key" ON "Influencer"("userId");
