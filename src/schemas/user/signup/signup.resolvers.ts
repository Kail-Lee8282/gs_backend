import { Resolver } from "../../../modules/types";
import { State } from "../../common.resolvers";
import { ErrCode } from "../../schemaErrCode";
import bcrypt from "bcrypt";

type SignupParameta = {
  email: string;
  userName: string;
  password: string;
  phoneNumber: string;
};

type SignupResult = {
  state: State;
};

const signup: Resolver<SignupResult> = async (
  _,
  { email, userName, password, phoneNumber }: SignupParameta,
  { dataSources: { productsDb: client } }
) => {
  try {
    // 사용자 중복 체크
    const existingUser = await client.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return {
        state: {
          ok: false,
          code: ErrCode.existEmail,
          message: "This email is already user",
        },
      };
    }

    // 패스워드 암호화
    const hashPwd = await bcrypt.hash(password, 10);

    // DB에 계정정보 저장
    await client.user.create({
      data: {
        email,
        password: hashPwd,
        userName,
        phoneNum: phoneNumber,
        gradeCode: "001",
      },
    });

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
    signup,
  },
};

export default resolvers;
