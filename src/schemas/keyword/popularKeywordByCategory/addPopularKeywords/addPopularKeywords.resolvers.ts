import { PrismaClient } from "@prisma/client";
import {
  getKeywordRanks,
  NaverKeywordRankInfo,
} from "../../../../api/naver/crawling/keywordRanks";
import { Resolver } from "../../../../modules/types";
import {
  dateToString,
  nowKrDate,
  upDateToString,
} from "../../../../util/dateToString";
import { superUserProtectedResolver } from "../../../../util/protectAccount";
import { State } from "../../../common.resolvers";
import { ErrCode } from "../../../schemaErrCode";
import { searchKeywordResult } from "../../keywordInfo/searchKeywordInfo/searchKeywordInfo.resolvers";

type AddPopularKeywordsParam = {
  cid: number;
  page: number;
};

type addPopularKeywordsResult = {
  state: State;
};

type InsertParam = {
  cid: number;
  searchDate: string;
};

export async function insertDbCategoryPopularKwds(
  client: PrismaClient,
  ranks: NaverKeywordRankInfo[],
  { cid, searchDate }: InsertParam
) {
  await client.$transaction(async () => {
    await client.categoryPopularKwd.deleteMany({
      where: {
        cid,
        date: searchDate,
      },
    });
    for (let i = 0; i < ranks.length; i++) {
      const { keyword, rank } = ranks[i];
      const kwd = keyword.toUpperCase();

      // 인기 검색어 추가
      await client.categoryPopularKwd.create({
        data: {
          date: searchDate,
          keyword: kwd,
          rank,
          categoryInfo: {
            connect: {
              cid,
            },
          },
        },
      });
    }
  });
}

/**
 * 인기 키워드 등록
 * @param _
 * @param param1
 * @returns
 */
const addPopularKeywords: Resolver<addPopularKeywordsResult> = async (
  _,
  { cid, page }: AddPopularKeywordsParam,
  context
) => {
  try {
    const {
      dataSources: { productsDb: client },
    } = context;
    // 한달 기준
    const beforMonth = nowKrDate();
    const beforday = nowKrDate();
    beforMonth.setMonth(beforMonth.getMonth() - 1);
    beforday.setDate(beforday.getDate() - 1);
    const searchDate = upDateToString(nowKrDate());

    // 1. 네이버에서 데이터 조회
    const { ranks } = await getKeywordRanks(
      cid,
      dateToString(beforMonth),
      dateToString(beforday),
      page
    );

    // 랭크 데이터 못 찾음.
    if (!ranks || ranks.length <= 0) {
      return {
        state: {
          ok: false,
          code: ErrCode.notFoundData,
          message: `not found rank data :: ${cid}|${page}`,
        },
      };
    }

    // 2. DB 저장
    await insertDbCategoryPopularKwds(client, ranks, { cid, searchDate });
    // await client.$transaction(async () => {
    //   await client.categoryPopularKwd.deleteMany({
    //     where: {
    //       cid,
    //       date: searchDate,
    //     },
    //   });
    //   for (let i = 0; i < ranks.length; i++) {
    //     const { keyword, rank } = ranks[i];
    //     const kwd = keyword.toUpperCase();

    //     // 인기 검색어 추가
    //     await client.categoryPopularKwd.create({
    //       data: {
    //         date: searchDate,
    //         keyword: kwd,
    //         rank,
    //         categoryInfo: {
    //           connect: {
    //             cid,
    //           },
    //         },
    //       },
    //     });
    //   }
    // });

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
    };
  } catch (e) {
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
  Mutation: {
    addPopularKeywords: superUserProtectedResolver(addPopularKeywords),
  },
};

export default resolvers;
