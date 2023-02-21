import { retry } from "../../../modules/retry";
import { Resolver } from "../../../modules/types";
import { loginCheckResovler } from "../../../util/protectAccount";
import { ErrCode } from "../../schemaErrCode";

type RemoveProductMonitoringKwdParam = {
  id: string;
};

const removeProductMonitoringKwd: Resolver = async (
  _,
  { id }: RemoveProductMonitoringKwdParam,
  { dataSources: { productsDb: client } }
) => {
  try {
    const existData = await client.monitoringKeyword.findUnique({
      where: {
        id,
      },
    });

    if (!existData) {
      return {
        state: {
          ok: false,
          code: ErrCode.existData,
          error: "monitoringKeyword is exist.",
        },
      };
    }

    await retry(
      0,
      client.$transaction(
        [
          client.monitoringKeywordRank.deleteMany({
            where: {
              keywordid: id,
            },
          }),
          client.monitoringKeyword.delete({
            where: {
              id,
            },
          }),
        ],
        {
          isolationLevel: "Serializable",
        }
      )
    );

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
    removeProductMonitoringKwd: loginCheckResovler(removeProductMonitoringKwd),
  },
};

export default resolvers;
