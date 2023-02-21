import { Resolver } from "../../../modules/types";
import { dateToString, nowKrDate } from "../../../util/dateToString";
import { loginCheckResovler } from "../../../util/protectAccount";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import {
  getProductDisplayPosition,
  MonitoringKeywordRank,
} from "../monitoring.resolvers";

type AddProductMonitoringKeywordResult = {
  state: State;
  result?: MonitoringKeywordRank;
};

type AddProductMonitoringKeywordParam = {
  productNo: string;
  keyword: string;
};

const addProductMonitoringKeyword: Resolver<
  AddProductMonitoringKeywordResult
> = async (
  _,
  { productNo, keyword }: AddProductMonitoringKeywordParam,
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    // 공백제거, 대문자 변경
    const kwd = (keyword as string).replace(" ", "").toUpperCase();

    // 파라메터 검증
    if (!productNo || productNo.length <= 0) {
      return {
        state: {
          ok: false,
          code: ErrCode.invalidParameter,
          error: "ProductNo is not Exist.",
        },
      };
    }

    if (!kwd || kwd.length <= 0) {
      return {
        state: {
          ok: false,
          code: ErrCode.invalidParameter,
          error: "Keyword is not Exist.",
        },
      };
    }

    // 키워드 존재 여부 확인
    const isExisting = await client.monitoringKeyword.findFirst({
      where: {
        userId: loginUser.id,
        productNo,
        keyword: kwd,
      },
    });

    if (isExisting) {
      return {
        state: {
          ok: false,
          code: ErrCode.existData,
          error: "Keyword Exist.",
        },
      };
    }

    const rankData = await getProductDisplayPosition(kwd, productNo);

    return await client.$transaction(async () => {
      // 데이터 추가
      const insertKeyword = await client.monitoringKeyword.create({
        data: {
          keyword: kwd,
          productMonitoring: {
            connect: {
              userId_storeProductNo: {
                storeProductNo: productNo,
                userId: loginUser.id,
              },
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!insertKeyword.id) {
        // 키워드 등록 실패
        return {
          state: {
            ok: false,
            code: ErrCode.filedAddProductMonitoringKeyword,
            error: "add keyword failed.",
          },
        };
      }

      const result = await client.monitoringKeywordRank.create({
        data: {
          date: dateToString(nowKrDate()),
          keywordid: insertKeyword.id,
          ...rankData,
        },
      });

      return {
        state: {
          ok: true,
          code: ErrCode.success,
        },
        result: {
          date: result.date,
          id: result.keywordid,
          rank: result.rank,
          page: result.page,
          index: result.index,
          adRank: result.adRank,
          adPage: result.adPage,
          adIndex: result.adIndex,
          updateAt: result.updatedAt,
        },
      };
    });
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
    addProductMonitoringKeyword: loginCheckResovler(
      addProductMonitoringKeyword
    ),
  },
};

export default resolvers;
