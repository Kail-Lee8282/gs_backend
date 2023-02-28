-- AddForeignKey
ALTER TABLE "CategoryPopularKwd" ADD CONSTRAINT "CategoryPopularKwd_keyword_fkey" FOREIGN KEY ("keyword") REFERENCES "KeywordInfo"("keyword") ON DELETE RESTRICT ON UPDATE CASCADE;
