import axios from "axios";

type NaverProduct = {
  category1Id: string;
  category1Name: string;
  category2Id: string;
  category2Name: string;
  category3Id: string;
  category3Name: string;
  category4Id: string;
  category4Name: string;
  crUrl: string;
  imageUrl: string;
  adImageUrl: string;
  productTitle: string;
  lowPrice: number;
  mallProductUrl: string;
  mallProductId: string;
  purchaseCnt: number;
  reviewCountSum: number;
  mallCount: number;
  adcrUrl: string;
  mallName: string;
  openDate: string;
  adId: string;
  gdid: string;
};

type NaverShoppingResult = {
  query: string;
  mallNo: string;
  productCount: number;
  total: number;
  products: NaverProduct[];
  cmp: {
    count: number;
    categories: {
      id: string;
      name: string;
      relevance: number;
    }[];
  };
};

type NaverShopListResponse = {
  mainFilters: any[];
  subFilters: any[];
  selectedFilters: any[];
  shoppingResult: NaverShoppingResult;
  relatedTags: string[];
  searchAdResult: {
    products: NaverProduct[];
    adMeta: any;
  };
};

export function getsearchProuctList(keyword: string, index?: number) {
  try {
    const pagingIndex = index ? index : 1;

    return axios.get<NaverShopListResponse>(
      "https://msearch.shopping.naver.com/api/search/all",
      {
        params: {
          sort: "rel",
          pagingIndex,
          pagingSize: 40,
          viewType: "lst",
          productSet: "total",
          frm: "NVSHPAG",
          query: keyword,
          origQuery: keyword,
        },
        headers: {
          referer: "https://msearch.shopping.naver.com/search/all",
        },
      }
    );
  } catch (e) {
    console.error("getShoppingProuctList", e);
    return null;
  }
}
