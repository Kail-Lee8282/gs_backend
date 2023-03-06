import { Resolver } from "../../modules/types";
import { Sleep } from "../../util/sleep";
import { ErrCode } from "../schemaErrCode";
import { getMobileProductShopList } from "../searchShops/naver/searchShops.naver.resolvers";

export type MonitoringKeyword = {
  keyword: string;
  id: string;
  ranks?: MonitoringKeywordRank[];
};

export type MonitoringProduct = {
  title: string; //제품 명
  productNo: string; // 제품 코드
  reviewCount: number; // 리뷰 개수
  reviewScore: number; // 리뷰 평점
  cumulationSaleCount?: number; // 6개월 판매개 수
  recentSaleCount?: number; //3일 판개 개수
  storeName: string; // 스토어 명
  salePrice: number; //실제 판매 가격 PC - 할일율 적용
  mobileSalePrice: number; // 실제 판매 가격 모바일 - 할인율 적용
  productImageUrl?: string; //제품 이미지
  productUrl: string;
  storeUrl?: string;
  wholeCategoryName?: string;
  searchTags?: string[];
  keywords?: MonitoringKeyword[];
};

/**
 * 제품 키워드 랭킹
 */
export type MonitoringKeywordRank = {
  date: string;
  index: number;
  page: number;
  rank: number;
  adIndex: number;
  adPage: number;
  adRank: number;
  id: string;
  updateAt: Date;
};

/**
 * 제품 표시위치 반환
 * @param keyword
 * @param productNo
 * @returns
 */
export async function getProductDisplayPosition(
  keyword: string,
  productNo: string
) {
  const result = {
    adIndex: -1,
    adPage: -1,
    adRank: -1,
    index: -1,
    page: -1,
    rank: -1,
  };
  try {
    let find = false;
    let findAd = false;
    for (let page = 1; page <= 20; page++) {
      const data = await getMobileProductShopList(keyword, page);

      const findIdx = data.findIndex((item) => item.productId === productNo);

      if (findIdx >= 0) {
        const index = findIdx + 1;
        if (data[findIdx].isAd) {
          result.adIndex = index;
          result.adPage = page;
          result.adRank = index * page;
          findAd = true;
        } else {
          result.index = index;
          result.page = page;
          result.rank = index * page;
          find = true;
        }
      }

      if (find && findAd) {
        break;
      }

      await Sleep(500);
    }
  } catch (e) {
    console.error("getProductDisplayPosition", e);
  }
  return result;
}

const resolvers = {
  Query: {
    getProductDisplayLocation: () => {
      return {
        state: {
          ok: true,
        },
      };
    },
  },
};

export default resolvers;
