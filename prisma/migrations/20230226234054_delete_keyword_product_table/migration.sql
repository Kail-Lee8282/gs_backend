/*
  Warnings:

  - You are about to drop the `Keywords` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryPopularKwd" DROP CONSTRAINT "CategoryPopularKwd_keyword_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_name_fkey";

-- DropTable
DROP TABLE "Keywords";

-- DropTable
DROP TABLE "Product";
