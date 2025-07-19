-- AlterTable
ALTER TABLE "InfluencerPlatform" ADD COLUMN     "commentsCount" INTEGER DEFAULT 0,
ADD COLUMN     "engagementRate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "likesCount" INTEGER DEFAULT 0,
ADD COLUMN     "savesCount" INTEGER DEFAULT 0,
ADD COLUMN     "sharesCount" INTEGER DEFAULT 0;
