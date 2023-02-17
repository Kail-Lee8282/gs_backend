-- CreateTable
CREATE TABLE "StoreKeywordRank" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "storeName" TEXT,
    "keyword" TEXT,
    "productId" TEXT,
    "isAd" BOOLEAN NOT NULL DEFAULT false,
    "productImg" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reviewCnt" INTEGER NOT NULL,
    "selesCnt" INTEGER NOT NULL,
    "seleStart" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreKeywordRank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreKeywordRank_userId_storeName_keyword_productId_key" ON "StoreKeywordRank"("userId", "storeName", "keyword", "productId");

-- AddForeignKey
ALTER TABLE "StoreKeywordRank" ADD CONSTRAINT "StoreKeywordRank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
