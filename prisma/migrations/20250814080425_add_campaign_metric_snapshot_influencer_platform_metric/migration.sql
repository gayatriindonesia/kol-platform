-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('CAMPAIGN_START', 'CAMPAIGN_END', 'PERIODIC', 'MANUAL');

-- CreateTable
CREATE TABLE "InfluencerPlatformMetric" (
    "id" TEXT NOT NULL,
    "influencerPlatformId" TEXT NOT NULL,
    "campaignId" TEXT,
    "followers" INTEGER NOT NULL,
    "following" INTEGER,
    "posts" INTEGER,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER DEFAULT 0,
    "engagementRate" DOUBLE PRECISION NOT NULL,
    "avgLikesPerPost" DOUBLE PRECISION,
    "avgCommentsPerPost" DOUBLE PRECISION,
    "metricType" "MetricType" NOT NULL DEFAULT 'PERIODIC',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSource" TEXT,

    CONSTRAINT "InfluencerPlatformMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMetricSnapshot" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "startMetrics" JSONB NOT NULL,
    "endMetrics" JSONB NOT NULL,
    "growthMetrics" JSONB NOT NULL,
    "totalGrowthFollowers" INTEGER NOT NULL DEFAULT 0,
    "totalGrowthEngagement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "performanceScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InfluencerPlatformMetric_campaignId_recordedAt_idx" ON "InfluencerPlatformMetric"("campaignId", "recordedAt");

-- CreateIndex
CREATE INDEX "InfluencerPlatformMetric_influencerPlatformId_recordedAt_idx" ON "InfluencerPlatformMetric"("influencerPlatformId", "recordedAt");

-- CreateIndex
CREATE INDEX "CampaignMetricSnapshot_campaignId_idx" ON "CampaignMetricSnapshot"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMetricSnapshot_campaignId_influencerId_platformId_key" ON "CampaignMetricSnapshot"("campaignId", "influencerId", "platformId");

-- AddForeignKey
ALTER TABLE "InfluencerPlatformMetric" ADD CONSTRAINT "InfluencerPlatformMetric_influencerPlatformId_fkey" FOREIGN KEY ("influencerPlatformId") REFERENCES "InfluencerPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerPlatformMetric" ADD CONSTRAINT "InfluencerPlatformMetric_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMetricSnapshot" ADD CONSTRAINT "CampaignMetricSnapshot_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
