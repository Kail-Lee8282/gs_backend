import { Category, PrismaClient } from "@prisma/client";
import { ContextValue, Resolver } from "../../modules/types";
import { ErrCode } from "../schemaErrCode";

type CategortResolver = (
  root: Category,
  args: any,
  context: ContextValue,
  info: any
) => any;

/**
 * 부모 카테고리 값 조회(재귀)
 * @param cid
 * @param client
 * @returns
 */
const getParentCategory = async (cid: number | null, client: PrismaClient) => {
  if (cid === null) return [];
  const item = await client.category.findUnique({
    where: {
      cid,
    },
    select: {
      cid: true,
      name: true,
      pid: true,
    },
  });

  if (item.pid !== null && item.pid >= 0) {
    const arr = await getParentCategory(item.pid, client);
    return [...arr, item];
  } else {
    return [item];
  }
};

/**
 * 부모 카테고리 반환
 * @param param0
 * @param _
 * @param param2
 * @returns
 */
const parent: CategortResolver = (
  { pid },
  _,
  { dataSources: { productsDb: client } }
) => getParentCategory(pid, client);

/**
 * 카테고리 레벨 반환
 * @param param0
 * @param _
 * @param param2
 * @returns
 */
const level: CategortResolver = async (
  { cid },
  _,
  { dataSources: { productsDb: client } }
) => {
  const res = (await getParentCategory(cid, client)) as [];
  if (res) {
    return res.length - 1;
  }

  return 0;
};

type GetCategoriesParameta = {
  cid: number;
};

/**
 * DB 카테고리 데이터를 가지고옴
 * @returns
 */
const getCategories: Resolver = async (
  _,
  { cid }: GetCategoriesParameta,
  { dataSources: { productsDb: client } }
) => {
  try {
    const data = await client.category.findUnique({
      where: {
        cid,
      },
      include: {
        children: true,
        parent: {
          select: {
            cid: true,
            name: true,
            pid: true,
          },
        },
      },
    });

    return {
      state: {
        ok: true,
      },
      result: data,
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
  Category: {
    parent,
    level,
  },

  Query: {
    getCategories,
  },
};

export default resolvers;
