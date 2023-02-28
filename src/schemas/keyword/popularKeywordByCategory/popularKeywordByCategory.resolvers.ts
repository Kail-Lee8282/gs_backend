import { PrismaClient } from "@prisma/client";
import { ContextValue, Resolver } from "../../../modules/types";

export type PopularKeyword = {
  keyword: string;
  cid: number;
  rank: number;
  categoryName?: string;
  monthlyClickCnt?: number;
  productCnt?: number;
};

type GetCatePopularKwdParam = {
  cid: number;
  keyword: string;
  date: string;
};

/** 금일 카테고리 인기 검색어 */
export async function getCategoryPopularKwd(
  { cid, keyword, date }: GetCatePopularKwdParam,
  client: PrismaClient
) {
  // DB 데이터 조회
  const searchData = await client.categoryPopularKwd.findMany({
    take: 20,
    skip: keyword ? 1 : 0,
    where: {
      date,
      cid,
    },
    orderBy: {
      rank: "asc",
    },
    ...(keyword && {
      cursor: {
        date_keyword_cid: {
          cid,
          date,
          keyword,
        },
      },
    }),
  });

  return searchData;
}

/**
 * 카테고리 명칭
 * @param param0
 * @param _
 * @param param2
 * @returns
 */
const categoryName: Resolver<string> = async (
  { cid }: PopularKeyword,
  _,
  { dataSources: { productsDb: client } }
) => {
  try {
    const { name } = await client.category.findUnique({
      where: {
        cid,
      },
      select: {
        name: true,
      },
    });

    return name;
  } catch (e) {
    return "";
  }
};

const resolvers = {
  PopularKeyword: {
    categoryName,
  },
  Query: {},
};

export default resolvers;
