-- CreateTable
CREATE TABLE "KeywordInfo" (
    "keyword" TEXT NOT NULL,
    "isSeason" BOOLEAN NOT NULL DEFAULT false,
    "isAdult" BOOLEAN NOT NULL DEFAULT false,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "isSellProhibit" BOOLEAN NOT NULL DEFAULT false,
    "isLowSearchVolume" BOOLEAN NOT NULL DEFAULT false,
    "totalSeller" INTEGER NOT NULL DEFAULT 0,
    "loPrice" INTEGER NOT NULL DEFAULT 0,
    "hiPrice" INTEGER NOT NULL DEFAULT 0,
    "avgPrice" INTEGER NOT NULL DEFAULT 0,
    "brandPercent" INTEGER NOT NULL DEFAULT 0,
    "totalSearch" INTEGER NOT NULL DEFAULT 0,
    "competitionRate" TEXT,
    "productImg" TEXT,
    "category" JSONB,
    "trandKwdByAge" JSONB,
    "trandKwdByGender" JSONB,
    "trandKwdByDevice" JSONB,
    "searchVolumeByMonth" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordInfo_pkey" PRIMARY KEY ("keyword")
);
