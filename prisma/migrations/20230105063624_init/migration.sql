-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNum" TEXT NOT NULL,
    "gradeCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "cid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "pid" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "Grade" (
    "code" TEXT NOT NULL,
    "gradeName" TEXT NOT NULL,
    "gradeDesc" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Keywords" (
    "keyword" TEXT NOT NULL,
    "isSeason" BOOLEAN NOT NULL DEFAULT false,
    "isAdult" BOOLEAN NOT NULL DEFAULT false,
    "isRestricted" BOOLEAN NOT NULL DEFAULT false,
    "isSellProhibit" BOOLEAN NOT NULL DEFAULT false,
    "isLowSearchVolume" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Keywords_pkey" PRIMARY KEY ("keyword")
);

-- CreateTable
CREATE TABLE "Product" (
    "date" TEXT NOT NULL,
    "name" TEXT NOT NULL,
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
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "KeywordChart" (
    "name" TEXT NOT NULL,
    "trandKwdByAge" JSONB,
    "trandKwdByGender" JSONB,
    "trandKwdByDevice" JSONB,
    "searchVolumeByMonth" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordChart_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "CategoryPopularKwd" (
    "date" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "cid" INTEGER NOT NULL,
    "rank" INTEGER
);

-- CreateTable
CREATE TABLE "ProductMonitoring" (
    "userId" TEXT NOT NULL,
    "storeProductNo" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "keywords" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Product_date_name_key" ON "Product"("date", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPopularKwd_date_keyword_cid_key" ON "CategoryPopularKwd"("date", "keyword", "cid");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMonitoring_userId_storeProductNo_key" ON "ProductMonitoring"("userId", "storeProductNo");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_gradeCode_fkey" FOREIGN KEY ("gradeCode") REFERENCES "Grade"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_pid_fkey" FOREIGN KEY ("pid") REFERENCES "Category"("cid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_name_fkey" FOREIGN KEY ("name") REFERENCES "Keywords"("keyword") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPopularKwd" ADD CONSTRAINT "CategoryPopularKwd_cid_fkey" FOREIGN KEY ("cid") REFERENCES "Category"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryPopularKwd" ADD CONSTRAINT "CategoryPopularKwd_keyword_fkey" FOREIGN KEY ("keyword") REFERENCES "Keywords"("keyword") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMonitoring" ADD CONSTRAINT "ProductMonitoring_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
