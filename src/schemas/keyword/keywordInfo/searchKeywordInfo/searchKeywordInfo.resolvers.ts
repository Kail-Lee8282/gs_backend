import { PrismaClient } from "@prisma/client";
import { getsearchProuctList } from "../../../../api/naver/crawling/searchProduct";
import {
  NaverDataLabAPI,
  NaverKeywordTrandResults,
  NaverShop,
} from "../../../../api/naver/naverDataLabApi";
import { ContextValue, Resolver } from "../../../../modules/types";
import { fullPathCategory } from "../../../../util/categoryUtil";
import {
  CalcNowDate,
  nowKrDate,
  upDateToString,
} from "../../../../util/dateToString";
import { Sleep } from "../../../../util/sleep";
import { State } from "../../../common.resolvers";
import { ErrCode } from "../../../schemaErrCode";
import {
  KeywordInfo,
  KeywordShopStatistics,
  KeywordStaticsData,
  ProductCategory,
  t_updateKwdInfo,
} from "../keywordInfo.resolvers";

type SearchKeywordInfoParam = {
  keyword: string;
};

type SearchKeywordInfoResult = {
  state: State;
  result?: KeywordInfo;
};

/**
 * 검색한 상품들 통계
 * @param searchList
 * @returns
 */
function top100ShopsStatistics(searchList: NaverShop) {
  const result = searchList.items.reduce<KeywordShopStatistics>(
    (acc, item) => {
      // 아이템 가격
      const itemPrice = Number(item.lprice);

      acc.totalPrice += itemPrice;

      // 최저가
      if (acc.lowPrice === 0 || acc.lowPrice > itemPrice)
        acc.lowPrice = itemPrice;

      // 최고가
      if (acc.hiPrice < itemPrice) acc.hiPrice = itemPrice;

      // 브랜드 점유율
      if (item.brand) {
        acc.brandCnt++;
        const findIdx = acc.brandInfos.findIndex(
          (info) => info.name === item.brand
        );
        if (findIdx < 0) {
          acc.brandInfos.push({
            name: item.brand,
            count: 1,
          });
        } else {
          acc.brandInfos[findIdx].count++;
        }
      }

      // 카테고리 비율
      const cateFullPath = fullPathCategory(
        item.category1,
        item.category2,
        item.category3,
        item.category4
      );

      const findIdx = acc.categoryRatio.findIndex(
        (child) =>
          fullPathCategory(
            child.category1,
            child.category2,
            child.category3,
            child.category4
          ) === cateFullPath
      );

      if (findIdx < 0) {
        acc.categoryRatio.push({
          category1: item.category1,
          category2: item.category2,
          category3: item.category3,
          category4: item.category4,
          count: 1,
          display: searchList.items.length,
        });
      } else {
        acc.categoryRatio[findIdx].count++;
      }

      return acc;
    },
    {
      brandCnt: 0,
      brandInfos: [],
      categoryRatio: [],
      hiPrice: 0,
      lowPrice: 0,
      totalPrice: 0,
      avgPrice: 0,
    }
  );

  result.categoryRatio = result.categoryRatio.sort((a, b) => b.count - a.count);
  result.avgPrice = Math.round(result.totalPrice / searchList.items.length);

  return result;
}

type searchKeywordResultOption = {
  sendMessage?: boolean;
};
/**
 * 키워드 검색 결과
 * @param keyword
 * @param param1
 * @returns
 */
export async function searchKeywordResult(
  keyword: string,
  {
    dataSources: { naverAdAPI, naverDataLabAPI, productsDb: client },
  }: ContextValue,
  option?: searchKeywordResultOption
): Promise<KeywordInfo> {
  const kwd = keyword.toUpperCase();

  let sendInsertMsg = true;
  if (option) {
    const { sendMessage } = option;
    sendInsertMsg = sendMessage;
  }

  // 2. 키워드 검색량 조회 (Naver Ad Api 조회)
  const { monthlyPcQcCnt, monthlyMobileQcCnt, compIdx } = (
    await naverAdAPI.getRelKwdStat(kwd, 0, 0, 1)
  ).keywordList?.find((item) => item.relKeyword === kwd);

  // PC 검색량
  const pcQcCnt = Number.isNaN(Number(monthlyPcQcCnt))
    ? 5
    : Number(monthlyPcQcCnt);
  // 모바일 검색량
  const mobileQcCnt = Number.isNaN(Number(monthlyMobileQcCnt))
    ? 5
    : Number(monthlyMobileQcCnt);

  // 3. 키워드 관리 (시즌, 성인 여부 확인)
  const manageKwd = await naverAdAPI.getManagedKeyword(kwd);

  // 4. 상위 100개 네이버 쇼핑 상품 검색 결과 통계
  const top100Shops = await naverDataLabAPI.getShop(keyword, 100);

  let totalPurchaseCnt = 0;
  // for (let i = 1; i <= 2; i++) {
  //   await Sleep(100);
  //   const naverPowerRank = await getsearchProuctList(keyword, i);

  //   naverPowerRank.data.shoppingResult.products.forEach((item) => {
  //     totalPurchaseCnt += item.purchaseCnt;
  //   });
  //   console.log(Date.now(), keyword, i);
  // }

  // 상위 100개 상품 카테고리 비율 / 평균가 / 최고가 / 최저값 / 브랜드 접유율 계산
  const shopStatic = top100ShopsStatistics(top100Shops);

  // 3. 월간 데이터 조회
  const searchVolume2Y = await get2YSearchVolumeStatic(
    kwd,
    pcQcCnt + mobileQcCnt,
    naverDataLabAPI
  );

  const result = {
    keyword: kwd,
    totalPurchaseCnt,
    totalSearch: pcQcCnt + mobileQcCnt,
    totalSeller: top100Shops.total,
    loPrice: shopStatic.lowPrice,
    hiPrice: shopStatic.hiPrice,
    avgPrice: shopStatic.avgPrice,
    brandPercent: Math.round(
      (shopStatic.brandCnt / top100Shops.items.length) * 100
    ),
    productImg:
      top100Shops && top100Shops.items && top100Shops.items.length > 0
        ? top100Shops.items[0].image
        : "",
    category: shopStatic.categoryRatio,
    isAdult: manageKwd.isAdult,
    isSeason: manageKwd.isSeason,
    isLowSearchVolume: manageKwd.isLowSearchVolume,
    isRestricted: manageKwd.isRestricted,
    isSellProhibit: manageKwd.isSellProhibit,
    competitionRate: compIdx,
    searchVolumeByMonth: searchVolume2Y,
  };

  // DB 저장
  if (sendInsertMsg) t_updateKwdInfo.postMessage(result);

  return result;
}

/**
 * 일별 데이터 월별로 병합
 * @param keyword
 * @param searchCnt
 * @param results
 * @returns
 */
function dailyDataMergeByMonth(
  keyword: string,
  day30SearchVolume: number,
  results: NaverKeywordTrandResults[]
) {
  const searchVolumeByMonth: KeywordStaticsData[] = [];
  // 24개월 serier 생성
  for (let i = 24; i >= 0; i--) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);
    searchVolumeByMonth.push({
      series: `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`,
      value: 0,
    });
  }
  try {
    const { data } = results.find((item) => item.title === keyword);

    // 30일 검색량 비율 계산
    let total_ratio = 0;
    data.forEach((item) => {
      if (new Date(item.period) >= new Date(CalcNowDate(0, 0, -31))) {
        total_ratio += item.ratio;
      }
    });

    const oneRatio = day30SearchVolume / total_ratio;

    data.forEach((item, index) => {
      const period = new Date(item.period);
      const date = `${period.getFullYear()}-${(period.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      const cnt = Math.round(item.ratio);
      const find = searchVolumeByMonth?.find((aitem) => aitem.series === date);
      if (find) {
        find.value += Math.round(cnt * oneRatio);
      }
    });
  } catch (e) {
    console.error("createSearchVolume", keyword, e);
  }

  return searchVolumeByMonth;
}

async function get2YSearchVolumeStatic(
  keyword: string,
  day30SearchVolume: number,
  naverDataLabAPI: NaverDataLabAPI
) {
  const before2Y = CalcNowDate(-2, 0, 0);

  // 2년 키워드 일별 데이터 조회
  const { results } = await naverDataLabAPI.getTotalKeywordTrandSearch(
    `${before2Y.getFullYear()}-${(before2Y.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-01`,
    upDateToString(nowKrDate()),
    "date",
    { groupName: keyword }
  );

  return dailyDataMergeByMonth(keyword, day30SearchVolume, results);
}

/**
 * 키워드 검색결과
 * @param _
 * @param param1
 * @param param2
 * @returns
 */
const searchKeywordInfo: Resolver<SearchKeywordInfoResult> = async (
  _,
  { keyword }: SearchKeywordInfoParam,
  { dataSources: { naverAdAPI, naverDataLabAPI, productsDb: client } }
) => {
  try {
    const kwd = keyword.toUpperCase();

    // 1. DB 데이터 검색
    const keywordInfo = await client.keywordInfo.findUnique({
      where: {
        keyword: kwd,
      },
    });

    if (keywordInfo) {
      const {
        keyword,
        isSeason,
        isAdult,
        isRestricted,
        isSellProhibit,
        isLowSearchVolume,
        totalSeller,
        loPrice,
        hiPrice,
        avgPrice,
        brandPercent,
        totalSearch,
        totalPurchaseCnt,
        competitionRate,
        productImg,
        category,
        searchVolumeByMonth,
      } = keywordInfo;

      return {
        state: {
          ok: true,
          code: ErrCode.success,
        },
        result: {
          keyword,
          isSeason,
          isAdult,
          isRestricted,
          isSellProhibit,
          isLowSearchVolume,
          totalSeller,
          loPrice,
          hiPrice,
          avgPrice,
          brandPercent,
          totalSearch,
          totalPurchaseCnt,
          competitionRate,
          productImg,
          category: category as ProductCategory[],
          searchVolumeByMonth: searchVolumeByMonth as KeywordStaticsData[],
        },
      };
    }

    // 2. 데이터 없을 경우 키워드 데이터 조회
    const kwdInfo = await searchKeywordResult(kwd, {
      dataSources: { naverAdAPI, naverDataLabAPI, productsDb: client },
    });

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
      result: kwdInfo,
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
    searchKeywordInfo,
  },
};

export default resolvers;
