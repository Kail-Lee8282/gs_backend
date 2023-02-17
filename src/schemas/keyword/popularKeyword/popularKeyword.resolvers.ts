import { PrismaClient } from "@prisma/client";
import {
  getKeywordRanks,
  NaverKeywordRankInfo,
} from "../../../api/naver/crawling/KeywordRanks";
import { ContextValue, Resolver } from "../../../modules/types";
import {
  dateToString,
  nowKrDate,
  upDateToString,
} from "../../../util/dateToString";
import { State } from "../../common.resolvers";
import { InsertProduct } from "../../product/addProduct/addProduct.resolvers";
import {
  finalCategory,
  Product,
  ProductCategory,
} from "../../product/product.resolvers";

export type PopularKeyword = {
  rank: number;
  keyword: string;
  cid?: number;
  monthlyClickCnt?: number;
  productCnt?: number;
  kwdCategoryName?: string;
  info?: Product | null;
};

type seePopularKwdResult = {
  data?: PopularKeyword[];
  state: State;
};

type seePopularKwdParameta = {
  cid: number;
  keyword: string;
};

const seePopularKwd: Resolver<seePopularKwdResult> = async (
  _,
  { cid, keyword }: seePopularKwdParameta,
  {
    dataSources: { productsDb: client, naverAdAPI: adApi, naverDataLabAPI },
    loginUser,
  }
) => {
  try {
    // 한달 기준
    const beforMonth = nowKrDate();
    const beforday = nowKrDate();
    beforMonth.setMonth(beforMonth.getMonth() - 1);
    beforday.setDate(beforday.getDate() - 1);
    const searchDate = upDateToString(nowKrDate());

    // 키워드 랭킹 조회
    let ranks: NaverKeywordRankInfo[] = [];

    // DB에서 오늘날짜 키워드 랭킹 조회
    const dbKwdRank = await client.categoryPopularKwd.findMany({
      take: 20,
      skip: keyword ? 1 : 0,
      where: {
        date: searchDate,
        cid,
      },
      orderBy: {
        rank: "asc",
      },
      ...(keyword && {
        cursor: {
          date_keyword_cid: {
            cid,
            date: searchDate,
            keyword,
          },
        },
      }),
    });

    if (dbKwdRank && dbKwdRank.length > 0) {
      // DB 에 데이터가 있으면 리턴
      ranks = dbKwdRank.map((item) => {
        return {
          keyword: item.keyword,
          rank: item.rank,
        } as NaverKeywordRankInfo;
      });
    } else {
      // DB에 데이터가 없을 경우 Naver에서 키워드 랭크 조회

      const rank = await client.categoryPopularKwd.findFirst({
        where: {
          date: searchDate,
          cid,
          keyword,
        },
        select: {
          rank: true,
        },
      });

      let page = 0;
      if (rank) {
        page = Math.round(rank.rank / 20) + 1;
      }

      // 데이버에서 데이터 조회
      const getPopularKwd = await getKeywordRanks(
        cid,
        dateToString(beforMonth),
        dateToString(beforday),
        page
      );

      ranks.push(...getPopularKwd.ranks);
      try {
        await Promise.all(
          ranks.map(async (item) => {
            const itemKeyword = item.keyword.toUpperCase();
            // keyword 등록 여부 확인
            const kwdInfo = await client.keywords.findUnique({
              where: { keyword: itemKeyword },
              select: {
                keyword: true,
              },
            });

            if (!kwdInfo) {
              // 키워드 등록 안되었을 경우.
              const managedKeyword = await adApi.getManagedKeyword(itemKeyword);

              await client.keywords.create({
                data: {
                  keyword: itemKeyword,
                  isSeason: managedKeyword.isSeason,
                  isAdult: managedKeyword.isAdult,
                  isRestricted: managedKeyword.isRestricted,
                  isLowSearchVolume: managedKeyword.isLowSearchVolume,
                },
              });
            }
          })
        );

        await client.categoryPopularKwd.createMany({
          data: ranks.map((item) => {
            const itemKeyword = item.keyword.toUpperCase();
            return {
              cid,
              date: searchDate,
              keyword: itemKeyword,
              rank: item.rank,
            };
          }),
          skipDuplicates: true,
        });
      } catch (e1) {
        console.error("insert popular kwd", e1);
      }
    }

    // const data = [] as PopularKeyword[];
    const data = await Promise.all(
      ranks.map(async (kwd) => {
        const keyword = kwd.keyword.toUpperCase();

        let product = await client.product.findUnique({
          where: {
            date_name: {
              date: searchDate,
              name: keyword,
            },
          },
          select: {
            totalSearch: true,
            totalSeller: true,
            category: true,
          },
        });

        if (product) {
          const categories = product.category as ProductCategory[];
          const categoryInfo = await getProductTopCategoryInfo(
            client,
            categories,
            cid
          );

          const item = {
            keyword: kwd.keyword,
            rank: kwd.rank,
            monthlyClickCnt: product.totalSearch,
            productCnt: product.totalSeller,
            ...categoryInfo,
          } as PopularKeyword;

          return item;
        } else {
          const addProduct = await InsertProduct(kwd.keyword, {
            dataSources: {
              productsDb: client,
              naverAdAPI: adApi,
              naverDataLabAPI,
            },
            loginUser,
          });
          const categoryInfo = await getProductTopCategoryInfo(
            client,
            addProduct.category,
            cid
          );

          const item = {
            keyword: kwd.keyword,
            rank: kwd.rank,
            monthlyClickCnt: addProduct.totalSearch,
            productCnt: addProduct.totalSeller,
            ...categoryInfo,
          } as PopularKeyword;

          return item;
        }
      })
    );

    return {
      data,
      state: {
        ok: true,
      },
    };
  } catch (e) {
    console.error("seePopularKwd", cid, e);
    return {
      state: {
        ok: false,
        error: e.message,
      },
    };
  }
};

async function getProductTopCategoryInfo(
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

const resolvers = {
  Query: {
    seePopularKwd,
  },
};

export default resolvers;
