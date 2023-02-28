import { getKeywordRanks } from "../api/naver/crawling/keywordRanks";
import client from "../modules/client";
import { dateToString, nowKrDate, upDateToString } from "../util/dateToString";
import { Sleep } from "../util/sleep";
import { NaverKeywordRankInfo } from "../api/naver/crawling/keywordRanks";
import { NaverAdAPI } from "../api/naver/naverShopAdApi";
import { insertDbCategoryPopularKwds } from "../schemas/keyword/popularKeywordByCategory/addPopularKeywords/addPopularKeywords.resolvers";

export async function updateTodayPopularKeyword() {
  try {
    // 카테고리 정보 조회
    const cidList = await client.category.findMany({
      where: {
        NOT: {
          cid: 0,
        },
      },
      select: {
        cid: true,
      },
    });

    // 오늘 날자 카테고리별 인기 키워드 등록
    const beforMonth = nowKrDate();
    const beforday = nowKrDate();
    beforMonth.setMonth(beforMonth.getMonth() - 1);
    beforday.setDate(beforday.getDate() - 1);
    const searchDate = upDateToString(nowKrDate());

    // DB에 오늘 날자 키워드 등록
    for (let i = 0; i < cidList.length; i++) {
      const { cid } = cidList[i];

      const popularKwd = await client.categoryPopularKwd.findFirst({
        where: {
          date: searchDate,
          cid,
        },
      });

      if (popularKwd) continue;

      let ranks: NaverKeywordRankInfo[] = [];

      console.log("search :: ", cid);
      // 데이버에서 데이터 Top 100 조회
      for (let page = 1; page <= 1; page++) {
        const getPopularKwd = await getKeywordRanks(
          cid,
          dateToString(beforMonth),
          dateToString(beforday),
          page
        );

        console.log(getPopularKwd.ranks);

        ranks.push(...getPopularKwd.ranks);

        await Sleep(500);
      }

      console.log("update popular keyword", cid);

      // 인기 키워드 등록
      // 2. DB 저장
      await insertDbCategoryPopularKwds(client, ranks, { cid, searchDate });

      await Sleep(300);
    }
  } catch (e) {
    console.error(e);
  }
}
