import { isMainThread, parentPort } from "worker_threads";
import client from "../modules/client";
import { KeywordInfo } from "../schemas/keyword/keywordInfo/keywordInfo.resolvers";

if (!isMainThread) {
  parentPort.on("message", async (data: KeywordInfo) => {
    try {
      const nowDate = new Date();

      const kwdInfo = await client.keywordInfo.findFirst({
        where: {
          keyword: data.keyword,
          updatedAt: {
            gt: new Date(
              `${nowDate.getUTCFullYear()}-${(nowDate.getUTCMonth() + 1)
                .toString()
                .padStart(2, "0")}-${nowDate
                .getUTCDate()
                .toString()
                .padStart(2, "0")} 00:00:00`
            ),
          },
        },
      });

      if (kwdInfo) return;

      console.log("upsert:", data.keyword);

      client.$transaction(async () => {
        await client.keywordInfo.upsert({
          create: {
            ...data,
          },
          update: {
            isAdult: data.isAdult,
            isSeason: data.isSeason,
            isLowSearchVolume: data.isLowSearchVolume,
            isRestricted: data.isRestricted,
            isSellProhibit: data.isSellProhibit,
            competitionRate: data.competitionRate,
            totalSearch: data.totalSearch,
            totalSeller: data.totalSeller,
            loPrice: data.loPrice,
            hiPrice: data.hiPrice,
            avgPrice: data.avgPrice,
            brandPercent: data.brandPercent,
            productImg: data.productImg,
            category: data.category,
          },
          where: {
            keyword: data.keyword,
          },
        });
      });
    } catch (e) {
      console.error("update.keywordinfo.worker", e);
    }
  });
}
