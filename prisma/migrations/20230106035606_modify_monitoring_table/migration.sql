/*
  Warnings:

  - You are about to drop the column `keywords` on the `ProductMonitoring` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductMonitoring" DROP COLUMN "keywords";

-- CreateTable
CREATE TABLE "MonitoringKeyword" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productNo" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "isAd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonitoringKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringKeywordRank" (
    "date" TEXT NOT NULL,
    "keywordid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MonitoringKeywordRank_date_keywordid_key" ON "MonitoringKeywordRank"("date", "keywordid");

-- AddForeignKey
ALTER TABLE "MonitoringKeyword" ADD CONSTRAINT "MonitoringKeyword_userId_productNo_fkey" FOREIGN KEY ("userId", "productNo") REFERENCES "ProductMonitoring"("userId", "storeProductNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoringKeywordRank" ADD CONSTRAINT "MonitoringKeywordRank_keywordid_fkey" FOREIGN KEY ("keywordid") REFERENCES "MonitoringKeyword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
