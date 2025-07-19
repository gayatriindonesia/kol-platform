-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'BRAND', 'INFLUENCER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'BRAND';
