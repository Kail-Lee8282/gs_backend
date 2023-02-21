import { Prisma } from "@prisma/client";
import { NaverKeywordTrandResults } from "../../../api/naver/naverDataLabApi";
import { Resolver } from "../../../modules/types";
import {
  CalcNowDate,
  nowKrDate,
  upDateToString,
} from "../../../util/dateToString";
import { ProductQueryAct } from "../../../worker/insert.product.worker";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import {
  createSelectProductInfo,
  t_insertProduct,
} from "../addProduct/addProduct.resolvers";
import { ProductChartData, Product } from "../product.resolvers";

type SeeProductParam = {
  keyword: string;
};

type SeeProductResult = {
  state: State;
  result?: Product;
};

function createSearchVolume(
  keyword: string,
  searchCnt: number,
  results: NaverKeywordTrandResults[]
) {
  const searchVolumeByMonth: ProductChartData[] = [];
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

    let total_ratio = 0;
    const laster30Data = data.filter((item) => {
      if (new Date(item.period) >= new Date(CalcNowDate(0, 0, -31))) {
        total_ratio += item.ratio;
        return item;
      }
    });

    const oneRatio = searchCnt / total_ratio;

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

const seeProduct: Resolver<SeeProductResult> = async (
  _,
  { keyword: kwd }: SeeProductParam,
  context
) => {
  try {
    if (kwd.length <= 0) throw "not exist keyword";

    const keyword = (kwd as string).toUpperCase();

    // DB에 금일 검색 결과 있는지 체크
    const findProduct = await createSelectProductInfo(keyword, context);

    // 2년 검색량
    let searchVolume: ProductChartData[] = [];
    if (findProduct) {
      console.log(findProduct.searchVolumeByMonth);
      if (!findProduct.searchVolumeByMonth) {
        const before2Y = CalcNowDate(-2, 0, 0);

        // 2년치 일별 데이터 조회

        const { results } =
          await context.dataSources.naverDataLabAPI.getTotalKeywordTrandSearch(
            `${before2Y.getFullYear()}-${(before2Y.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-01`,
            upDateToString(nowKrDate()),
            "date",
            { groupName: keyword }
          );
        searchVolume = createSearchVolume(
          keyword,
          findProduct.totalSearch,
          results
        );

        const message: ProductQueryAct = {
          type: "U",
          date: findProduct.date,
          keyword: findProduct.name,
          query: {
            where: {
              date_name: {
                date: findProduct.date,
                name: findProduct.name,
              },
            },
            data: {
              searchVolumeByMonth: searchVolume as Prisma.JsonArray,
            },
          },
        };
        t_insertProduct.postMessage(message);
      }

      const result = {
        state: {
          ok: true,
          code: ErrCode.success,
        },
        result: { ...findProduct, searchVolumeByMonth: searchVolume },
      };

      return result;
    }

    return {
      state: {
        ok: false,
        code: ErrCode.notFoundData,
        message: "not found data.",
      },
    };
  } catch (e) {
    console.error("seeProduct", e);
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
    seeProduct,
  },
};

export default resolvers;
