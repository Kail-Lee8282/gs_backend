import { CategoryPopularKwd, PrismaClient } from "@prisma/client";
import { getKeywordRanks } from "../../../../api/naver/crawling/keywordRanks";
import { Resolver } from "../../../../modules/types";
import {
  dateToString,
  nowKrDate,
  upDateToString,
} from "../../../../util/dateToString";
import { loginCheckResovler } from "../../../../util/protectAccount";
import { State } from "../../../common.resolvers";
import { ErrCode } from "../../../schemaErrCode";
import { PopularKeyword } from "../popularKeywordByCategory.resolvers";
import { searchKeywordResult } from "../../keywordInfo/searchKeywordInfo/searchKeywordInfo.resolvers";
import {
  getKeywordTopCategory,
  ProductCategory,
} from "../../keywordInfo/keywordInfo.resolvers";

type SeePopularKeywordsParam = {
  cid: number;
  page: number;
};

type SeePopularKeywordsResult = {
  state: State;
  result?: PopularKeyword[];
};

/**
 * 카테고리 별 인기 키워드 반환
 * @returns
 */
const seePopularKeywords: Resolver<SeePopularKeywordsResult> = async (
  _,
  { cid, page }: SeePopularKeywordsParam,
  { dataSources: { productsDb: client, naverAdAPI, naverDataLabAPI } }
) => {
  try {
    // 한달 기준
    const beforMonth = nowKrDate();
    const beforday = nowKrDate();
    beforMonth.setMonth(beforMonth.getMonth() - 1);
    beforday.setDate(beforday.getDate() - 1);
    const searchDate = upDateToString(nowKrDate());

    const searchPage = page <= 0 ? 1 : page;

    // // DB 최근 데이터 조회
    // if (searchPage <= 1) {
    //   const lastDate = await client.categoryPopularKwd.groupBy({
    //     by: ["date"],
    //     where: {
    //       cid,
    //     },
    //     orderBy: {
    //       date: "desc",
    //     },
    //   });

    //   if (lastDate && lastDate.length > 0) {
    //     const lastData = await client.categoryPopularKwd.findMany({
    //       where: {
    //         date: lastDate[0].date,
    //         cid,
    //       },
    //     });

    //     return {
    //       state: {
    //         ok: true,
    //         code: ErrCode.success,
    //       },
    //       result: convertToPopularKeyword(lastData),
    //     };
    //   }
    // }

    // 1. 네이버에서 데이터 조회
    const { ranks } = await getKeywordRanks(
      cid,
      dateToString(beforMonth),
      dateToString(beforday),
      searchPage
    );

    const result = [];

    for (let i = 0; i < ranks.length; i++) {
      const item = ranks[i];

      // DB에 상품이 있는지 확인
      const keywordInfo = await client.keywordInfo.findUnique({
        where: {
          keyword: item.keyword,
        },
      });

      let monthlyClickCnt = 0;
      let productCnt = 0;
      let topCid = cid;
      if (keywordInfo) {
        monthlyClickCnt = keywordInfo.totalSearch;
        productCnt = keywordInfo.totalSeller;
        const mainCate = await getKeywordTopCategory(
          client,
          keywordInfo.category as ProductCategory[],
          cid
        );
        topCid = mainCate.cid;
      } else {
        const searchInfo = await searchKeywordResult(item.keyword, {
          dataSources: { naverAdAPI, naverDataLabAPI, productsDb: client },
        });

        monthlyClickCnt = searchInfo.totalSearch;
        productCnt = searchInfo.totalSeller;

        const mainCate = await getKeywordTopCategory(
          client,
          searchInfo.category,
          cid
        );
        topCid = mainCate.cid;
      }

      result.push({
        keyword: item.keyword,
        rank: item.rank,
        cid: topCid,
        monthlyClickCnt,
        productCnt,
      } as PopularKeyword);
    }

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
      result,
    };
  } catch (e) {
    console.error("seePopularKeywords", e);
    return {
      state: {
        ok: false,
        code: ErrCode.unknownErr,
        message: e.message,
      },
    };
  }
};

const resolvers = {
  Query: {
    seePopularKeywords: loginCheckResovler(seePopularKeywords),
  },
};

export default resolvers;
