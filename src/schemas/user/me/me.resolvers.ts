import { Resolver } from "../../../modules/types";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import { User } from "../user.resolvers";

type MeResult = {
  state: State;
  result?: User;
};

/**
 * 로그인된 사용자 정보를 조회
 * @returns 로그인된 정보 반환
 */
const me: Resolver<MeResult> = async (
  _,
  __,
  { dataSources: { productsDb: client }, loginUser }
) => {
  try {
    if (!loginUser) {
      return {
        state: {
          ok: false,
          code: ErrCode.notLogin,
          message: "no user is logged in",
        },
      };
    }

    const user = await client.user.findUnique({
      where: {
        id: loginUser.id,
      },
      include: {
        grade: true,
      },
    });

    if (!user) {
      return {
        state: {
          ok: false,
          code: ErrCode.notFoundUser,
          message: "not exist user.",
        },
      };
    }

    console.log("me");

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
      result: {
        email: user.email,
        userName: user.userName,
        grade: {
          level: user.grade.level,
          gradeName: user.grade.gradeName,
          gradeDesc: user.grade.gradeDesc,
        },
      },
    };
  } catch (e) {
    return {
      state: {
        ok: false,
        code: ErrCode.unknownErr,
        message: "me[ERR]" + e.message,
      },
    };
  }
};

const resolvers = {
  Query: {
    me,
  },
};

export default resolvers;
