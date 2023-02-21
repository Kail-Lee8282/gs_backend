import axios from "axios";

type NaverSimpleProductResponse = {
  id: number;
  category: {
    wholeCategoryid: string;
    wholeCategoryName: string;
    categoryId: string;
    categoryName: string;
  };
  name: string;
  channel: {
    channelNo: number;
    accountNo: number;
    channelName: string;
  };
  productNo: number;
  salePrice: number;
  seoInfo: {
    sellerTags: { code: number; text: string }[];
  };
  naverShoppingSearchInfo: {
    manufacturerName: string;
    brandName: string;
    modelName: string;
  };
  benefitsView: {
    discountedSalePrice: number;
    mobileDiscountedSalePrice: number;
  };
  saleAmount: {
    cumulationSaleCount: number;
    recentSaleCount: number;
  };
  reviewAmount: {
    totalReviewCount: number;
    premiumRevieCount: number;
    averageReviewScore: number;
    productSatisfactionPercent: number;
  };
  representativeImageUrl: string;
};

export function getProductInfo(productNo: string) {
  try {
    return axios.get<NaverSimpleProductResponse>(
      `https://smartstore.naver.com/i/v1/simple-products/${productNo}`
    );
  } catch (e) {
    console.error("getProductInfo", e);
    return null;
  }
}
