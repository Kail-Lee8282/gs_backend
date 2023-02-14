import { NaverAdAPI } from "../api/naver/naverShopAdApi";
import { NaverDataLabAPI } from "../api/naver/naverDataLabApi";
import { PrismaClient, User } from "@prisma/client";
import { BaseContext } from "@apollo/server/";

export type ContextValue = BaseContext & {
  dataSources?: {
    naverDataLabAPI: NaverDataLabAPI;
    naverAdAPI: NaverAdAPI;
    productsDb: PrismaClient;
  };
  loginUser?: User;
};

export type Resolvers<T = any> = (
  root: any,
  args: any,
  context: ContextValue,
  info: any
) => Promise<T> | T;

export type State = {
  ok: boolean;
  error?: string;
};
