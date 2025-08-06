-- CreateTable
CREATE TABLE "RateCard" (
    "id" TEXT NOT NULL,
    "influencerPlatformId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateCard_influencerPlatformId_serviceId_key" ON "RateCard"("influencerPlatformId", "serviceId");

-- AddForeignKey
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_influencerPlatformId_fkey" FOREIGN KEY ("influencerPlatformId") REFERENCES "InfluencerPlatform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
