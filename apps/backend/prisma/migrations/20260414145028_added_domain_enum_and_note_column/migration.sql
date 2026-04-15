/*
  Warnings:

  - The `domain` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Domain" AS ENUM ('EDTECH', 'FINTECH', 'PREVIOUS_YEAR', 'BRAND_ACTIVATION', 'MEDIA', 'STATIONERY', 'AI_TECH', 'STARTUP', 'FITNESS', 'GAMING', 'FMCG', 'AUDIO_MOBILE', 'BANK', 'AUTOMOBILE_TRAVEL', 'FASHION', 'SKINCARE', 'HEALTHCARE', 'WORKSHOP', 'MISCELLANEOUS');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "note" TEXT,
DROP COLUMN "domain",
ADD COLUMN     "domain" "Domain" NOT NULL DEFAULT 'EDTECH';

-- CreateIndex
CREATE INDEX "Company_domain_idx" ON "Company"("domain");
