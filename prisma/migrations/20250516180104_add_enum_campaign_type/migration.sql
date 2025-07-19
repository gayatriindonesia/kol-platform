/*
  Warnings:

  - Added the required column `type` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('DIRECT', 'SELF_SERVICE');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "directData" JSONB,
ADD COLUMN     "selfServiceData" JSONB,
ADD COLUMN     "type" "CampaignType" NOT NULL;
