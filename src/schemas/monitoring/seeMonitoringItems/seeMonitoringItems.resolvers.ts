import { getProductInfo } from "../../../api/naver/crawling/productInfo";
import { Resolver } from "../../../modules/types";
import { loginCheckResovler } from "../../../util/protectAccount";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import {
  MonitoringKeyword,
  MonitoringKeywordRank,
  MonitoringProduct,
} from "../monitoring.resolvers";

type SeeProductMonitoringItemsResult = {
  state: State;
  result?: MonitoringProduct[];
};

const seeMonitoringItems: Resolver<SeeProductMonitoringItemsResult> = async (
  _,
  __,
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    // 사용자가 등록한 모니터링 아이템 조회
    const monitoringItems = await client.productMonitoring.findMany({
      where: {
        userId: loginUser.id,
      },
    });

    const data: MonitoringProduct[] = [];
    for (let i = 0; i < monitoringItems.length; i++) {
      const item = monitoringItems[i];
      const res_ProductInfo = await getProductInfo(item.storeProductNo);
      const res_Keywords = await client.monitoringKeyword.findMany({
        where: {
          productNo: item.storeProductNo,
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
      if (productInfo) {
        data.push({
          productNo: item.storeProductNo,
          title: productInfo.name,
          reviewCount: productInfo.reviewAmount.totalReviewCount,
          reviewScore: productInfo.reviewAmount.averageReviewScore,
          cumulationSaleCount: productInfo.saleAmount.cumulationSaleCount,
          recentSaleCount: productInfo.saleAmount.recentSaleCount,
          storeName: productInfo.channel.channelName,
          salePrice: productInfo.benefitsView.discountedSalePrice,
          mobileSalePrice: productInfo.benefitsView.mobileDiscountedSalePrice,
          productImageUrl: productInfo.representativeImageUrl,
          productUrl: item.productUrl,
          keywords: keywordRanks,
        });
      }
    }

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
    seeMonitoringItems: loginCheckResovler(seeMonitoringItems),
  },
};

export default resolvers;
