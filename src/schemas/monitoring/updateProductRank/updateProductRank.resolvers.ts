import { Resolver } from "../../../modules/types";
import { dateToString, nowKrDate } from "../../../util/dateToString";
import { loginCheckResovler } from "../../../util/protectAccount";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import {
  getProductDisplayPosition,
  MonitoringKeywordRank,
} from "../monitoring.resolvers";

type UpdateProductRankParam = {
  id: string;
};

type UpdateProductRankResult = {
  state: State;
  result?: MonitoringKeywordRank;
};

/**
 * 제품 표시 랭크를 최신화
 * @returns
 */
const updateProductRank: Resolver<UpdateProductRankResult> = async (
  _,
  { id }: UpdateProductRankParam,
  { dataSources: { productsDb: client } }
) => {
  try {
    const keywordInfo = await client.monitoringKeyword.findUnique({
      where: {
        id,
      },
      select: {
        keyword: true,
        productNo: true,
      },
    });

    if (!keywordInfo) {
      return {
        state: { ok: false, error: "Monitoring keyword is exist" },
      };
    }

    const nowDate = dateToString(nowKrDate());
    const find = await client.monitoringKeywordRank.findUnique({
      where: {
        date_keywordid: {
          date: nowDate,
          keywordid: id,
        },
      },
    });

    if (find) {
      if (find.updatedAt.getTime() + 600000 >= Date.now()) {
        return {
          state: {
            ok: false,
            error: "Can't update within 10 min.",
          },
        };
      }
    }

    const data = await getProductDisplayPosition(
      keywordInfo.keyword,
      keywordInfo.productNo
    );

    const upsertData = await client.monitoringKeywordRank.upsert({
      update: {
        ...data,
      },
      create: {
        date: nowDate,
        keywordid: id,
        ...data,
      },
      where: {
        date_keywordid: {
          date: nowDate,
          keywordid: id,
        },
      },
    });

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
      result: {
        id,
        rank: upsertData.rank,
        page: upsertData.page,
        index: upsertData.index,
        adRank: upsertData.adRank,
        adPage: upsertData.adPage,
        adIndex: upsertData.adIndex,
        date: upsertData.date,
        updateAt: upsertData.updatedAt,
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
    updateProductRank: loginCheckResovler(updateProductRank),
  },
};

export default resolvers;
