/*
  Warnings:

  - You are about to drop the column `keyword` on the `StoreKeywordRank` table. All the data in the column will be lost.
  - You are about to drop the column `storeName` on the `StoreKeywordRank` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `StoreKeywordRank` table. All the data in the column will be lost.
  - Added the required column `productUrl` to the `StoreKeywordRank` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StoreKeywordRank" DROP CONSTRAINT "StoreKeywordRank_userId_fkey";

-- DropIndex
DROP INDEX "StoreKeywordRank_userId_storeName_keyword_productId_key";

-- AlterTable
ALTER TABLE "StoreKeywordRank" DROP COLUMN "keyword",
DROP COLUMN "storeName",
DROP COLUMN "userId",
ADD COLUMN     "productUrl" TEXT NOT NULL,
ADD COLUMN     "storeKwdMonitoringId" TEXT;

-- CreateTable
CREATE TABLE "StoreKeywordMonitoring" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "storeName" TEXT,
    "keyword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreKeywordMonitoring_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoreKeywordMonitoring" ADD CONSTRAINT "StoreKeywordMonitoring_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreKeywordRank" ADD CONSTRAINT "StoreKeywordRank_storeKwdMonitoringId_fkey" FOREIGN KEY ("storeKwdMonitoringId") REFERENCES "StoreKeywordMonitoring"("id") ON DELETE SET NULL ON UPDATE CASCADE;
