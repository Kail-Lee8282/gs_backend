import axios from "axios";

export interface NaverKeywordRankInfo {
  keyword: string;
  linkId: string;
  rank: number;
  productCount?: number;
}

interface NaverKeywordRanks {
  date: string;
  datetime: string;
  message: string | null;
  range: string;
  ranks: NaverKeywordRankInfo[];
  returnCode: number;
  statesCode: number;
}

/**
 * 카테고리에 대한 인기 키워드 조회
 * @param cid
 * @param startDate
 * @param endDate
 * @returns
 */
export async function getKeywordRanks(
  cid: number,
  startDate: string,
  endDate: string,
  page?: number
) {
  try {
    const res = await axios.post<NaverKeywordRanks>(
      "https://datalab.naver.com/shoppingInsight/getCategoryKeywordRank.naver",
      {
        cid,
        timeUnit: "date",
        startDate,
        endDate,
        page: page ? page : 1,
        count: 20,
      },
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          referer: "https://datalab.naver.com/shoppingInsight/sCategory.naver",
        },
      }
    );

    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}
