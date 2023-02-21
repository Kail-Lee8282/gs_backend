import * as jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Resolver, ContextValue } from "../modules/types";
import { ErrCode } from "../schemas/schemaErrCode";
/**
 * 토큰 값에 대응하는 사용자 정보를 조회
 * @param client
 * @param token
 * @returns
 */
export const getUser = async (client: PrismaClient, token: string) => {
  try {
    if (!token) {
      return null;
    }
    const verifiedToken: any = await jwt.verify(token, process.env.SECRET_KEY);

    if ("id" in verifiedToken) {
      const user = await client.user.findUnique({
        where: {
          id: verifiedToken["id"],
        },
      });

      if (user) {
        return user;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export function loginCheckResovler(ourResolver: Resolver) {
  return function (root: any, args: any, context: ContextValue, info: any) {
    if (!context.loginUser) {
      return {
        state: {
          ok: false,
          code: ErrCode.notLogin,
          message: "Please login to perform this action",
        },
      };
    }
    return ourResolver(root, args, context, info);
  };
}

/**
 * 최고관리자 이용가능
 * @param ourResolver
 * @returns
 */
export function superUserProtectedResolver(ourResolver: Resolver) {
  return function (root: any, args: any, context: ContextValue, info: any) {
    // const query = info.operation.operation === "query";
    if (!context.loginUser) {
      // if (query) {
      //   return null;
      // } else {
      return {
        state: {
          ok: false,
          code: ErrCode.notLogin,
          message: "Please login to perform this action",
        },
      };
      // }
    } else {
      if (context.loginUser.gradeCode !== "999") {
        // if (query) {
        // return null;
        // } else {
        return {
          state: {
            ok: false,
            code: ErrCode.withoutPermission,
            message: "user without permission",
          },
        };
        // }
      }
    }
    return ourResolver(root, args, context, info);
  };
}
