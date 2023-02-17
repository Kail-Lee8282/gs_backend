/*
  Warnings:

  - The primary key for the `StoreKeywordRank` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `productId` on the `StoreKeywordRank` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,storeKwdMonitoringId]` on the table `StoreKeywordRank` will be added. If there are existing duplicate values, this will fail.
  - Made the column `storeKwdMonitoringId` on table `StoreKeywordRank` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "StoreKeywordRank" DROP CONSTRAINT "StoreKeywordRank_storeKwdMonitoringId_fkey";

-- AlterTable
ALTER TABLE "StoreKeywordRank" DROP CONSTRAINT "StoreKeywordRank_pkey",
DROP COLUMN "productId",
ALTER COLUMN "storeKwdMonitoringId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StoreKeywordRank_id_storeKwdMonitoringId_key" ON "StoreKeywordRank"("id", "storeKwdMonitoringId");

-- AddForeignKey
ALTER TABLE "StoreKeywordRank" ADD CONSTRAINT "StoreKeywordRank_storeKwdMonitoringId_fkey" FOREIGN KEY ("storeKwdMonitoringId") REFERENCES "StoreKeywordMonitoring"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
