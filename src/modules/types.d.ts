import { NaverAdAPI } from "../api/naver/naverShopAdApi";
import { NaverDataLabAPI } from "../api/naver/naverDataLabApi";
import { PrismaClient, User } from "@prisma/client";
import { BaseContext } from "@apollo/server/";
import { State } from "../schemas/common.resolvers";

export type ContextValue = BaseContext & {
  dataSources?: {
    naverDataLabAPI: NaverDataLabAPI;
    naverAdAPI: NaverAdAPI;
    productsDb: PrismaClient;
  };
  loginUser?: User;
};

type ResolverResult = {
  state: State;
  result?: any;
};

export type Resolver<T = ResolverResult | any> = (
  root: any,
  args: any,
  context: ContextValue,
  info: any
) => Promise<T> | T;
