import { loadFiles } from "@graphql-tools/load-files";
import { Prisma } from "@prisma/client";
import { Worker } from "worker_threads";
import { ContextValue } from "../../../modules/types";
import { nowKrDate, upDateToString } from "../../../util/dateToString";
import {
  fullPathCategory,
  Product,
  ProductCategory,
} from "../product.resolvers";
import { StartDir } from "../../../dirPath";
import { ProductQueryAct } from "../../../worker/insert.product.worker";

const insertProductWorkerPath = await loadFiles(
  `${StartDir()}/worker/insert.product.worker.{ts,js}`,
  {
    requireMethod: async (path) => {
      return path;
    },
  }
);

export const t_insertProduct = new Worker(insertProductWorkerPath[0]);

/**
 * 제품 등록 및 생성
 * @param keyword
 * @param client
 * @param naverAdAPI
 * @returns
 */
export async function createSelectProductInfo(
  keyword: string,
  context: ContextValue
): Promise<Product> {
  try {
    const {
      dataSources: { productsDb: client },
    } = context;
    if (!keyword || keyword.length <= 0) throw "not exist keyword";

    const date = upDateToString(nowKrDate());
    const upperKwd = keyword.toUpperCase();
    const findProduct = await client.product.findFirst({
      where: {
        date,
        name: upperKwd,
      },
      include: {
        keywordInfo: {
          select: {
            isAdult: true,
            isLowSearchVolume: true,
            isRestricted: true,
            isSeason: true,
            isSellProhibit: true,
          },
        },
      },
    });

    // DB 데이터 있을 경우
    if (findProduct) {
      console.log(findProduct.date, "find", upperKwd);

      return {
        date: findProduct.date,
        name: findProduct.name,
        totalSeller: findProduct.totalSeller,
        totalSearch: findProduct.totalSearch,
        productImg: findProduct.productImg,
        loPrice: findProduct.loPrice,
        hiPrice: findProduct.hiPrice,
        avgPrice: findProduct.avgPrice,
        competitionRate: findProduct.competitionRate,
        brandPercent: findProduct.brandPercent,
        isAdult: findProduct.keywordInfo.isAdult,
        isLowSearchVolume: findProduct.keywordInfo.isLowSearchVolume,
        isRestricted: findProduct.keywordInfo.isRestricted,
        isSeason: findProduct.keywordInfo.isSeason,
        isSellProhibit: findProduct.keywordInfo.isSellProhibit,
        category: findProduct.category as ProductCategory[],
        // trandKwdByAge: ConvertToProductChartDataArray(
        //   findProduct.trandKwdByAge
        // ),
        // trandKwdByDevice: ConvertToProductChartDataArray(
        //   findProduct.trandKwdByDevice
        // ),
        // trandKwdByGender: ConvertToProductChartDataArray(
        //   findProduct.trandKwdByGender
        // ),
      };
    }

    const product = await InsertProduct(keyword, context);

    return product;
  } catch (e) {
    console.error(keyword, e);
    return null;
  }
}

export async function InsertProduct(
  kwd: string,
  {
    dataSources: { naverAdAPI, naverDataLabAPI, productsDb: client },
  }: ContextValue
): Promise<Product> {
  try {
    const keyword = kwd.toUpperCase();

    const date = upDateToString(nowKrDate());
    const product = await client.product.findUnique({
      where: {
        date_name: {
          date,
          name: keyword,
        },
      },
    });

    if (!product) {
      const res = await naverAdAPI.getRelKwdStat(keyword, 0, 0, 1);
      const find = res.keywordList.find((item) => item.relKeyword === keyword);
      const pcQcCnt = Number.isNaN(Number(find?.monthlyPcQcCnt))
        ? 5
        : Number(find?.monthlyPcQcCnt);
      const moQcCnt = Number.isNaN(Number(find?.monthlyMobileQcCnt))
        ? 5
        : Number(find?.monthlyMobileQcCnt);
      const DISPLAY = 100;
      const shop = await naverDataLabAPI.getShop(keyword, DISPLAY);

      const managedKwd = await naverAdAPI.getManagedKeyword(keyword);

      let lowPrice = 0;
      let hiPrice = 0;
      let totalPrice = 0;
      let brandCnt = 0;
      let categories = shop.items.reduce<ProductCategory[]>((acc, item) => {
        const curPrice = Number(item.lprice);
        // 평균가
        totalPrice += curPrice;
        //최저가
        if (lowPrice === 0 || lowPrice > curPrice) lowPrice = curPrice;
        //최고가
        if (hiPrice === 0 || hiPrice < curPrice) hiPrice = curPrice;

        // 브랜드 점유율
        if (item.brand) {
          brandCnt++;
        }

        const idx = acc.findIndex(
          (accItem) =>
            fullPathCategory(
              accItem.category1,
              accItem.category2,
              accItem.category3,
              accItem.category4
            ) ===
            fullPathCategory(
              item.category1,
              item.category2,
              item.category3,
              item.category4
            )
        );

        if (idx >= 0) {
          acc[idx].count++;
        } else {
          acc.push({
            category1: item.category1,
            category2: item.category2,
            category3: item.category3,
            category4: item.category4,
            display: shop.items.length,
            count: 1,
          });
        }
        return acc;
      }, []);

      // 정렬
      categories = categories.sort((a, b) => b.count - a.count);

      const itemCount = shop.items?.length > 0 ? shop.items.length : 0;
      const productImg = shop.items.length > 0 && shop.items[0].image;
      const avgPrice = Math.round(totalPrice / itemCount);
      const brandPercent = Math.round((brandCnt / itemCount) * 100);

      const productData = {
        date,
        name: keyword,
        totalSeller: shop.total,
        totalSearch: pcQcCnt + moQcCnt,
        loPrice: lowPrice,
        hiPrice,
        avgPrice,
        brandPercent,
        competitionRate: find.compIdx,
        productImg,
        category: categories,
        isAdult: managedKwd?.isAdult,
        isSeason: managedKwd?.isSeason,
        isLowSearchVolume: managedKwd?.isLowSearchVolume,
        isRestricted: managedKwd?.isRestricted,
        isSellProhibit: managedKwd?.isSellProhibit,
      } as Product;

      const message: ProductQueryAct = {
        type: "I",
        date,
        keyword,
        query: {
          create: {
            date: productData.date,
            totalSeller: productData.totalSeller,
            totalSearch: productData.totalSearch,
            loPrice: productData.loPrice,
            hiPrice: productData.hiPrice,
            avgPrice: productData.avgPrice,
            brandPercent: productData.brandPercent,
            competitionRate: productData.competitionRate,
            productImg: productData.productImg,
            category: productData.category as Prisma.JsonArray,
            keywordInfo: {
              connectOrCreate: {
                create: {
                  keyword: productData.name,
                  isAdult: productData.isAdult,
                  isSeason: productData.isSeason,
                  isLowSearchVolume: productData.isLowSearchVolume,
                  isRestricted: productData.isRestricted,
                  isSellProhibit: productData.isSellProhibit,
                },
                where: {
                  keyword: keyword,
                },
              },
            },
          },
          update: {},
          where: {
            date_name: {
              date: date,
              name: keyword,
            },
          },
        },
      };

      t_insertProduct.postMessage(message);

      return productData;
    } else {
      return {
        date: product.date,
        name: product.name,
        totalSeller: product.totalSeller,
        totalSearch: product.totalSearch,
        productImg: product.productImg,
        loPrice: product.loPrice,
        hiPrice: product.hiPrice,
        avgPrice: product.avgPrice,
        competitionRate: product.competitionRate,
        brandPercent: product.brandPercent,
      };
    }
  } catch (e) {
    console.error("SearchNInsertProduct", kwd, e);
  }
}

const resolvers = {
  Mutation: {
    addProduct: () => {
      return {
        ok: true,
      };
    },
  },
};

export default resolvers;
