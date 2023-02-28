import { Resolver } from "../../../../modules/types";
import { State } from "../../../common.resolvers";
import { NaverShop } from "../../../../api/naver/naverDataLabApi";
import { ErrCode } from "../../../schemaErrCode";
import { fullPathCategory } from "../../../../util/categoryUtil";
import { Prisma } from "@prisma/client";
import {
  KeywordShopStatistics,
  ProductCategory,
  t_updateKwdInfo,
} from "../keywordInfo.resolvers";
import { searchKeywordResult } from "../searchKeywordInfo/searchKeywordInfo.resolvers";

type AddKeywordInfoParam = {
  keyword: string;
};

type addKeywordInfoResult = {
  state: State;
};

/**
 * 키워드 정보 추가
 * @returns
 */
const addKeywordInfo: Resolver<addKeywordInfoResult> = async (
  _,
  { keyword }: AddKeywordInfoParam,
  { dataSources: { naverAdAPI, naverDataLabAPI, productsDb: client } }
) => {
  try {
    // 1. 키워드 대문자 치환
    const kwd = keyword.toUpperCase();

    // 2. 키워드 검색 결과
    const result = await searchKeywordResult(kwd, {
      dataSources: { naverAdAPI, naverDataLabAPI, productsDb: client },
    });

    if (!result) {
      return {
        state: {
          ok: false,
          code: ErrCode.notFoundData,
          message: "not search results found.",
        },
      };
    }

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
    addKeywordInfo,
  },
};

export default resolvers;
