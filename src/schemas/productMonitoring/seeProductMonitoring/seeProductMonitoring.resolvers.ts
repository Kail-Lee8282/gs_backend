import { getProductInfo } from "../../../api/naver/crawling/productInfo";
import { Resolver } from "../../../modules/types";
import { loginCheckResovler } from "../../../util/protectAccount";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import { MonitoringKeyword, MonitoringProduct } from "../monitoring.resolvers";

type SeeProductMonitoringParam = {
  productNo: string;
};

type SeeProductMonitoringResult = {
  state: State;
  result?: MonitoringProduct;
};
/**
 * 모니터링 아이템 상세 정보 조회
 * @returns
 */
const seeProductMonitoring: Resolver<SeeProductMonitoringResult> = async (
  _,
  { productNo }: SeeProductMonitoringParam,
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    const dbProductInfo = await client.productMonitoring.findUnique({
      where: {
        userId_storeProductNo: {
          storeProductNo: productNo,
          userId: loginUser.id,
        },
      },
    });

    if (!dbProductInfo) {
      return {
        state: {
          ok: false,
          error: "Item is not exist",
        },
      };
    }

    const res_ProductInfo = await getProductInfo(productNo);
    const res_Keywords = await client.monitoringKeyword.findMany({
      where: {
        productNo: productNo,
        userId: loginUser.id,
      },
      include: {
        MonitoringKeywordRank: {
          select: {
            date: true,
            index: true,
            keywordid: true,
            page: true,
            rank: true,
            adIndex: true,
            adPage: true,
            adRank: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: "asc",
          },
        },
      },
    });

    const keywordRanks = res_Keywords.map<MonitoringKeyword>((item) => {
      return {
        keyword: item.keyword,
        id: item.id,
        ranks: item.MonitoringKeywordRank?.map((rank) => {
          return {
            date: rank.date,
            id: rank.keywordid,
            index: rank.index,
            page: rank.page,
            rank: rank.rank,
            adIndex: rank.adIndex,
            adPage: rank.adPage,
            adRank: rank.adRank,
            updateAt: rank.updatedAt,
          };
        }),
      };
    });

    const productInfo = res_ProductInfo.data;
    if (!productInfo) {
      return {
        state: {
          ok: false,
          error: "Not exist product infomation",
        },
      };
    }

    const data = {
      productNo: productNo,
      title: productInfo.name,
      reviewCount: productInfo.reviewAmount.totalReviewCount,
      reviewScore: productInfo.reviewAmount.averageReviewScore,
      cumulationSaleCount: productInfo.saleAmount?.cumulationSaleCount,
      recentSaleCount: productInfo.saleAmount?.recentSaleCount,
      storeName: productInfo.channel.channelName,
      salePrice: productInfo.benefitsView.discountedSalePrice,
      mobileSalePrice: productInfo.benefitsView.mobileDiscountedSalePrice,
      productImageUrl: productInfo.representativeImageUrl,
      productUrl: dbProductInfo.productUrl,
      keywords: keywordRanks,
      wholeCategoryName: res_ProductInfo.data.category.wholeCategoryName,
      searchTags: res_ProductInfo.data.seoInfo.sellerTags?.map(
        (item) => item.text
      ),
    };

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
    seeProductMonitoring: loginCheckResovler(seeProductMonitoring),
  },
};

export default resolvers;
