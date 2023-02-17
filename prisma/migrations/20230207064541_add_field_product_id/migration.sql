/*
  Warnings:

  - Added the required column `productId` to the `StoreKeywordRank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StoreKeywordRank" ADD COLUMN     "productId" TEXT NOT NULL;
