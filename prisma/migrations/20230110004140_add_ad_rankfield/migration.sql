/*
  Warnings:

  - You are about to drop the column `isAd` on the `MonitoringKeywordRank` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MonitoringKeywordRank" DROP COLUMN "isAd",
ADD COLUMN     "adIndex" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "adPage" INTEGER NOT NULL DEFAULT -1,
ADD COLUMN     "adRank" INTEGER NOT NULL DEFAULT -1,
ALTER COLUMN "index" SET DEFAULT -1,
ALTER COLUMN "page" SET DEFAULT -1,
ALTER COLUMN "rank" SET DEFAULT -1;
