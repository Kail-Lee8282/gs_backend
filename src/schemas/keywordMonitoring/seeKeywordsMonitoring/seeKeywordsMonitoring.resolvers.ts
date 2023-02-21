import { Resolver } from "../../../modules/types";
import { dateTimeToString } from "../../../util/dateToString";
import { loginCheckResovler } from "../../../util/protectAccount";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import { StoreKeywordRank } from "../keywordMonitoring.resolvers";

type SeeKeyowrdsMonitoringResult = {
  state: State;
  result?: StoreKeywordRank[];
};

/**
 * 키워드 모니터링 정보 조회
 * @returns
 */
const seeKeywordsMonitoring: Resolver<SeeKeyowrdsMonitoringResult> = async (
  _,
  __,
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    // 로그인 사용자가 등록한 스토어 키워드 랭킹 조회
    const keywordList = await client.storeKeywordRank.findMany({
      where: {
        StoreMonitoring: {
          userId: loginUser.id,
        },
      },
      include: {
        StoreMonitoring: {
          select: {
            keyword: true,
            storeName: true,
          },
        },
      },
    });

    // 페이지 전달 데이터 컨버팅
    const data = keywordList.map<StoreKeywordRank>((item) => {
      const { storeName, keyword } = item.StoreMonitoring;

      return {
        id: item.id,
        storeName,
        keyword,
        title: item.title,
        isAd: item.isAd,
        productId: item.productId,
        productImg: item.productImg,
        productUrl: item.productUrl,
        reviewCount: item.reviewCnt,
        purchaseCount: item.selesCnt,
        rank: item.rank,
        page: item.page,
        index: item.index,
        seleStart: item.seleStart,
        updatedAt: dateTimeToString(item.updatedAt),
      };
    });

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
      result: data,
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
  Query: {
    seeKeywordsMonitoring: loginCheckResovler(seeKeywordsMonitoring),
  },
};

export default resolvers;
