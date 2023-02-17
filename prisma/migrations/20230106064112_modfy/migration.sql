/*
  Warnings:

  - You are about to drop the column `index` on the `MonitoringKeyword` table. All the data in the column will be lost.
  - You are about to drop the column `isAd` on the `MonitoringKeyword` table. All the data in the column will be lost.
  - You are about to drop the column `page` on the `MonitoringKeyword` table. All the data in the column will be lost.
  - You are about to drop the column `rank` on the `MonitoringKeyword` table. All the data in the column will be lost.
  - Added the required column `index` to the `MonitoringKeywordRank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `page` to the `MonitoringKeywordRank` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `MonitoringKeywordRank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MonitoringKeyword" DROP COLUMN "index",
DROP COLUMN "isAd",
DROP COLUMN "page",
DROP COLUMN "rank";

-- AlterTable
ALTER TABLE "MonitoringKeywordRank" ADD COLUMN     "index" INTEGER NOT NULL,
ADD COLUMN     "isAd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "page" INTEGER NOT NULL,
ADD COLUMN     "rank" INTEGER NOT NULL;
