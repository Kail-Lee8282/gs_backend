import { Resolver } from "../../../modules/types";
import { dateTimeToString } from "../../../util/dateToString";
import { loginCheckResovler } from "../../../util/protectAccount";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import {
  FindStoreKeyword,
  StoreKeywordRank,
} from "../keywordMonitoring.resolvers";

type UpdateKwdMonitoringParam = {
  storeName: string;
  keyword: string;
};

type UpdateKwdMonitoringResult = {
  state: State;
};

/**
 * 모니터링 중인 키워드 최신화
 * @returns
 */
const updateKeywordMonitoring: Resolver<UpdateKwdMonitoringResult> = async (
  _,
  { storeName, keyword }: UpdateKwdMonitoringParam,
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    if (storeName.length <= 0 || keyword.length <= 0) {
      return {
        state: {
          ok: false,
          code: ErrCode.invalidParameter,
          error: "not exist parametas",
        },
      };
    }

    // 스토어 키워드 랭킹 리스트 조회
    const findData = await FindStoreKeyword(storeName, keyword);

    // DB 에 Rank 조회
    const selectRank = await client.storeKeywordMonitoring.findFirst({
      where: {
        storeName,
        keyword,
        userId: loginUser.id,
      },
      include: {
        StoreKeywordRank: true,
      },
    });

    // storeKeywordMonitoring ID
    let monitoringId = "";

    // DB에 저장 수정 할 데이터 리스트
    let upsetData: StoreKeywordRank[] = [];

    // 1. 모니터링 정보 체크
    if (selectRank) {
      monitoringId = selectRank.id;
      if (selectRank.StoreKeywordRank) {
        // DB에 있는 값 최신 값으로 변경
        upsetData = selectRank.StoreKeywordRank.map((item) => {
          const equlseData = findData.find((find) => find.id === item.id);
          if (equlseData) {
            return {
              ...equlseData,
            } as StoreKeywordRank;
          } else {
            // 검색되지 않는 값
            return {
              id: item.id,
              storeName,
              keyword,
              isAd: item.isAd,
              productId: item.productId,
              productImg: item.productImg,
              productUrl: item.productUrl,
              title: item.title,
              reviewCount: item.reviewCnt,
              purchaseCount: item.selesCnt,
              seleStart: item.seleStart,
              rank: -1,
              page: -1,
              index: -1,
            } as StoreKeywordRank;
          }
        });
      }
    }

    // 2. DB에 없는 데이터 확인 및 추가
    findData.forEach((item) => {
      const exist = upsetData.findIndex((data) => data.id === item.id);
      if (exist < 0) {
        upsetData.push(item);
      }
    });

    // DB 과 요청한 웹에 데이터가 없을 경우
    if (upsetData.length <= 0) {
      console.log("not exist update data");
      return {
        state: {
          ok: true,
          code: ErrCode.success,
        },
        result: [],
      };
    }
    // 3. 데이터 추가 및 수정 트렌젝션
    const resultData = await client.$transaction(async (tx) => {
      // 부모 테이블 값 없을 경우 추가
      if (monitoringId.length <= 0) {
        const { id } = await tx.storeKeywordMonitoring.create({
          data: {
            keyword,
            storeName,
            User: {
              connect: {
                id: loginUser.id,
              },
            },
          },
          select: {
            id: true,
          },
        });
        monitoringId = id;
      }

      // 데이터 추가
      for (let i = 0; i < upsetData.length; i++) {
        const modifyData = upsetData[i];

        const { updatedAt } = await tx.storeKeywordRank.upsert({
          create: {
            id: modifyData.id,
            StoreMonitoring: {
              connect: {
                id: monitoringId,
              },
            },
            isAd: modifyData.isAd,
            productId: modifyData.productId,
            productImg: modifyData.productImg,
            productUrl: modifyData.productUrl,
            title: modifyData.title,
            reviewCnt: modifyData.reviewCount,
            selesCnt: modifyData.purchaseCount,
            seleStart: modifyData.seleStart,
            rank: modifyData.rank,
            page: modifyData.page,
            index: modifyData.index,
          },
          update: {
            productImg: modifyData.productImg,
            productUrl: modifyData.productUrl,
            title: modifyData.title,
            reviewCnt: modifyData.reviewCount,
            selesCnt: modifyData.purchaseCount,
            seleStart: modifyData.seleStart,
            rank: modifyData.rank,
            page: modifyData.page,
            index: modifyData.index,
          },
          where: {
            id_storeKwdMonitoringId: {
              id: modifyData.id,
              storeKwdMonitoringId: monitoringId,
            },
          },
          select: {
            updatedAt: true,
          },
        });

        modifyData.updatedAt = dateTimeToString(updatedAt);
      }

      return upsetData;
    });

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
      result: resultData,
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
    updateKeywordMonitoring: loginCheckResovler(updateKeywordMonitoring),
  },
};

export default resolvers;
