import { loadFiles } from "@graphql-tools/load-files";
import { PrismaClient } from "@prisma/client";
import { Worker } from "worker_threads";
import { StartDir } from "../../../dirPath";
import { Resolver } from "../../../modules/types";
import { fullPathCategory } from "../../../util/categoryUtil";

export type KeywordShopStatistics = {
  lowPrice: number;
  hiPrice: number;
  totalPrice: number;
  brandCnt: number;
  brandInfos: {
    name: string;
    count: number;
  }[];
  categoryRatio: ProductCategory[];
  avgPrice: number;
};

export type ProductCategory = {
  category1?: string;
  categoryCid1?: number;
  category2?: string;
  categoryCid2?: number;
  category3?: string;
  categoryCid3?: number;
  category4?: string;
  categoryCid4?: number;
  fullCategory?: string;
  percent?: number;
  display?: number;
  count?: number;
};

export type KeywordInfo = {
  keyword: string;
  cid?: number;
  /** 시즌 키워드 */
  isSeason?: boolean;
  /** 성인 키워드 */
  isAdult?: boolean;
  /** 제한된 키워드 */
  isRestricted?: boolean;
  /** 판매금지 키워드 */
  isSellProhibit?: boolean;
  /** 낮은 판매량 */
  isLowSearchVolume?: boolean;
  /** 키워드 전체 제품 판매 수량 */
  totalSeller?: number;
  /** 키워드 최저가 */
  loPrice?: number;
  /** 키워드 최고가 */
  hiPrice?: number;
  /** 키워드 평균가 */
  avgPrice?: number;
  /** 키워드 브랜드 점유율 */
  brandPercent?: number;
  /** 한달 검색량 */
  totalSearch?: number;
  /** 6개월간 상위 80개 상품 판매개수 */
  totalPurchaseCnt?: number;
  /** 경쟁 강도 */
  competitionRate?: string;
  /** 키워드 대표 이미지 */
  productImg?: string;
  /** 키워드 카테고리  */
  category?: ProductCategory[];
  /** 키워드 월간 검색량 */
  searchVolumeByMonth?: KeywordStaticsData[];
  /** 최근 업데이트 일시 */
  updatedAt?: Date;
};

export type KeywordStaticsData = {
  series: string;
  value: number;
};

const updateKeywordWorkerPath = await loadFiles(
  `${StartDir()}/worker/update.keywordInfo.worker.{ts,js}`,
  {
    requireMethod: async (path) => {
      return path;
    },
  }
);

export const t_updateKwdInfo = new Worker(updateKeywordWorkerPath[0]);

/**
 * 마지막 카테고리 명칭 반환
 * @param category
 * @returns
 */
function finalCategory(category?: ProductCategory) {
  if (category) {
    return category.category4 && category.category4.length > 0
      ? category.category4
      : category.category3 && category.category3.length > 0
      ? category.category3
      : category.category2 && category.category2.length > 0
      ? category.category2
      : category.category1;
  } else {
    return "";
  }
}

/**
 * 키워드의 높은 비율의 카테고리 정보 반환
 * @param client
 * @param data
 * @param defaultCid 기본 카테고리 아이디
 * @returns
 */
export async function getKeywordTopCategory(
  client: PrismaClient,
  data: ProductCategory[],
  defaultCid: number
) {
  let itemCid = defaultCid;
  let itemCategoryName = "";
  if (data && data.length > 0) {
    const lastCategory = finalCategory(data[0]);
    itemCategoryName = lastCategory;
    const { cid: lastCid } = await client.category.findFirst({
      where: {
        name: lastCategory,
      },
      select: {
        cid: true,
      },
    });

    if (lastCid && lastCid > 0) {
      itemCid = lastCid;
    }
  }

  return {
    cid: itemCid,
    kwdCategoryName: itemCategoryName,
  };
}

const fullCategory: Resolver<string> = ({
  category1,
  category2,
  category3,
  category4,
}) => {
  return fullPathCategory(category1, category2, category3, category4);
};

const percent: Resolver<number> = ({ display, count }: ProductCategory) => {
  return Math.round((count / display) * 100);
};

const categoryCid1: Resolver<number> = async (
  { category1 },
  _,
  { dataSources: { productsDb: client } }
) => {
  const { cid } = await client.category.findFirst({
    where: {
      name: category1,
    },
    select: {
      cid: true,
    },
  });

  return cid;
};
const categoryCid2: Resolver<number> = async (
  { category2 },
  _,
  { dataSources: { productsDb: client } }
) => {
  const { cid } = await client.category.findFirst({
    where: {
      name: category2,
    },
    select: {
      cid: true,
    },
  });

  return cid;
};
const categoryCid3: Resolver<number> = async (
  { category3 },
  _,
  { dataSources: { productsDb: client } }
) => {
  const { cid } = await client.category.findFirst({
    where: {
      name: category3,
    },
    select: {
      cid: true,
    },
  });

  return cid;
};
const categoryCid4: Resolver<number> = async (
  { category4 },
  _,
  { dataSources: { productsDb: client } }
) => {
  const { cid } = await client.category.findFirst({
    where: {
      name: category4,
    },
    select: {
      cid: true,
    },
  });

  return cid;
};

const getKeywordInfoCid: Resolver<number> = async (
  { category }: KeywordInfo,
  _,
  { dataSources: { productsDb: client } }
) => {
  if (category) {
    const { cid } = await getKeywordTopCategory(client, category, 0);
    return cid;
  }
  return 0;
};

const resolvers = {
  KeywordInfo: {
    cid: getKeywordInfoCid,
  },
  ProductCategory: {
    fullCategory,
    percent,
    categoryCid1,
    categoryCid2,
    categoryCid3,
    categoryCid4,
  },
};

export default resolvers;
