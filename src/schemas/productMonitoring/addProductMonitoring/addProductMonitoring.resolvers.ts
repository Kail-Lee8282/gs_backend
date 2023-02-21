import { getProductInfo } from "../../../api/naver/crawling/productInfo";
import { Resolver } from "../../../modules/types";
import { dateToString, nowKrDate } from "../../../util/dateToString";
import { loginCheckResovler } from "../../../util/protectAccount";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import { getProductDisplayPosition } from "../monitoring.resolvers";

type AddProductMonitoringParam = {
  uri: string;
};

type AddProductMonitoringResult = {
  state: State;
  result?: {
    id: string;
  };
};

const NAVER_SMART_STORE_URL_PATTERN =
  /(smartstore.naver.com\/)([-a-zA-Z0-9])*(\/products\/)([0-9]+)/gi;

/**
 * 모니터링 할 제품 등록
 * @returns
 */
const addProductMonitoring: Resolver<AddProductMonitoringResult> = async (
  _,
  { uri }: AddProductMonitoringParam,
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    // 네이버 스마트 스토어 제품만 허용
    const match = (uri as string).match(NAVER_SMART_STORE_URL_PATTERN);
    if (!match) {
      return {
        state: {
          ok: false,
          code: ErrCode.invalidUrl,
          message: "this url isn't a naver store product.",
        },
      };
    }

    const productUrl = new URL(`https://${match[0]}`);
    // 0: empty
    // 1: store code
    // 2: "products"
    // 3: productNo
    const pathName = productUrl.pathname.split("/");

    // 제품 ID 확인
    let productNo = "";
    if (pathName.length >= 4) {
      productNo = pathName[3];
    } else {
      return {
        state: {
          ok: false,
          code: ErrCode.notExistProductId,
          message: "Product Id exists.",
        },
      };
    }

    // DB 에 모니터링 아이템 존재 하는 확인
    const productItem = await client.productMonitoring.findUnique({
      where: {
        userId_storeProductNo: {
          userId: loginUser.id,
          storeProductNo: productNo,
        },
      },
    });

    if (productItem) {
      // 이미 존재하는 데이터
      return {
        state: {
          ok: false,
          code: ErrCode.existData,
          message: "Product item exists.",
        },
      };
    }

    // 모니터링 할 제품 등록
    const res = await getProductInfo(productNo);
    const keywords = [res.data.category.categoryName];

    await client.productMonitoring.create({
      data: {
        productUrl: productUrl.href,
        storeProductNo: productNo,
        user: {
          connect: {
            id: loginUser.id,
          },
        },
      },
    });

    if (keywords?.length > 0) {
      const keyword = keywords[0];
      const mKeywordInfo = await client.monitoringKeyword.create({
        data: {
          productMonitoring: {
            connect: {
              userId_storeProductNo: {
                storeProductNo: productNo,
                userId: loginUser.id,
              },
            },
          },
          keyword,
        },
      });

      const data = await getProductDisplayPosition(keyword, productNo);

      await client.monitoringKeywordRank.create({
        data: {
          date: dateToString(nowKrDate()),
          keywordid: mKeywordInfo.id,
          ...data,
        },
      });
    }

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
      result: {
        id: productNo,
      },
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
  Mutation: {
    addProductMonitoring: loginCheckResovler(addProductMonitoring),
  },
};

export default resolvers;
