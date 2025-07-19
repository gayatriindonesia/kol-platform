-- CreateTable
CREATE TABLE "InfluencerCategory" (
    "influencerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "InfluencerCategory_pkey" PRIMARY KEY ("influencerId","categoryId")
);

-- CreateTable
CREATE TABLE "InfluencerPlatform" (
    "id" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,

    CONSTRAINT "InfluencerPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfluencerPlatform_influencerId_platformId_key" ON "InfluencerPlatform"("influencerId", "platformId");

-- AddForeignKey
ALTER TABLE "InfluencerCategory" ADD CONSTRAINT "InfluencerCategory_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerCategory" ADD CONSTRAINT "InfluencerCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerPlatform" ADD CONSTRAINT "InfluencerPlatform_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerPlatform" ADD CONSTRAINT "InfluencerPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;
