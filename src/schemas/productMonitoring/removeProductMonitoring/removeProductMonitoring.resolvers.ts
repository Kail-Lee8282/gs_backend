import { retry } from "../../../modules/retry";
import { Resolver } from "../../../modules/types";
import { loginCheckResovler } from "../../../util/protectAccount";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";

type RemoveProductMonitoringParam = {
  productNo: string;
};

/**
 * 모니터링 제품 삭제
 * @param _
 * @param param1
 * @param param2
 * @returns
 */
const removeProductMonitoring: Resolver = async (
  _,
  { productNo }: RemoveProductMonitoringParam,
  { loginUser, dataSources: { productsDb: client } }
) => {
  try {
    const existItem = await client.productMonitoring.findUnique({
      where: {
        userId_storeProductNo: {
          storeProductNo: productNo,
          userId: loginUser.id,
        },
      },
    });

    if (!existItem) {
      return {
        state: {
          ok: false,
          code: ErrCode.notFoundData,
          error: "Not exist productMonitoring data.",
        },
      };
    }

    const removeId = await client.monitoringKeyword.findMany({
      where: {
        userId: loginUser.id,
        productNo,
      },
      select: {
        id: true,
      },
    });

    if (!removeId || removeId.length <= 0) {
      return {
        state: {
          ok: false,
          message: "Not exist keyword.",
        },
      };
    }

    const result = await retry(
      0,
      client.$transaction(
        [
          client.monitoringKeywordRank.deleteMany({
            where: {
              OR: removeId.map((item) => {
                return { keywordid: item.id };
              }),
            },
          }),
          client.monitoringKeyword.deleteMany({
            where: {
              OR: removeId.map((item) => {
                return { id: item.id };
              }),
            },
          }),
          client.productMonitoring.delete({
            where: {
              userId_storeProductNo: {
                storeProductNo: productNo,
                userId: loginUser.id,
              },
            },
          }),
        ],
        {
          isolationLevel: "Serializable",
        }
      )
    );

    if (result.err) {
      return {
        state: {
          ok: false,
          coed: ErrCode.failedRemoveProductMonitoring,
          message: result.err.message,
        },
      };
    }

    return {
      state: {
        ok: true,
        code: ErrCode.success,
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
    removeProductMonitoring: loginCheckResovler(removeProductMonitoring),
  },
};

export default resolvers;
