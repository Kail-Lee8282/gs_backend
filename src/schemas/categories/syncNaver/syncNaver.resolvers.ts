import { PrismaClient } from "@prisma/client";
import { getCategoriesFormNaver } from "../../../api/naver/crawling/naverCategories";
import { Resolver } from "../../../modules/types";
import { superUserProtectedResolver } from "../../../util/protectAccount";
import { Sleep } from "../../../util/sleep";
import { ErrCode } from "../../schemaErrCode";

type SyncNaverCategoriesParameta = {
  cid: number;
};

async function InsertNaverCategory(cid: number, client: PrismaClient) {
  await Sleep(200);
  // 네이버 cid 해당하는 카테고리 정보를 조회
  const root = await getCategoriesFormNaver(cid);
  if (root && root.childList && root.childList.length > 0) {
    const param = root.childList.map((item) => {
      return {
        cid: item.cid,
        name: item.name,
        pid: item.pid,
      };
    });

    console.log(param);

    await client.category.createMany({
      data: param,
      skipDuplicates: true,
    });

    for (let i = 0; i < root.childList.length; i++) {
      const item = root.childList[i];
      await InsertNaverCategory(item.cid, client);
    }
  }
}

/**
 * 네이버 카테고리 정보를 DB 와 동기화
 * @param _
 * @param param1
 * @param param2
 * @returns
 */
const syncNaverCategories: Resolver = async (
  _,
  { cid }: SyncNaverCategoriesParameta,
  { dataSources: { productsDb } }
) => {
  try {
    await InsertNaverCategory(cid, productsDb);

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
    syncNaverCategories: superUserProtectedResolver(syncNaverCategories),
  },
};

export default resolvers;
