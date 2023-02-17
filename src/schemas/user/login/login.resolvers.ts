import { Resolver } from "../../../modules/types";
import { State } from "../../common.resolvers";
import { User } from "../user.resolvers";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ErrCode } from "../../schemaErrCode";

type LoginResult = {
  state: State;
  token?: String;
};

type LoginParameta = {
  email: string;
  password: string;
};

/**
 * 사용자 로그인을 하고 토큰을 전달
 * @param _
 * @param param1
 * @param param2
 * @returns
 */
const login: Resolver<LoginResult> = async (
  _,
  { email, password }: LoginParameta,
  { dataSources: { productsDb: client } }
) => {
  try {
    // 사용자 확인
    const user = await client.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      return {
        state: {
          ok: false,
          code: ErrCode.notFoundEmail,
          message: "not found email.",
        },
      };
    }

    // 패스워드 확인
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      return {
        state: {
          ok: false,
          code: ErrCode.incorrectPwd,
          message: "Incorrect password.",
        },
      };
    }

    // 토큰생성
    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);

    return {
      state: {
        ok: true,
        code: ErrCode.success,
      },
      token,
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
    login,
  },
};

export default resolvers;
