import axios from "axios";
import { retry } from "../../../modules/retry";

type NaverCategoryResponse = {
  cid: number;
  pid: number;
  name: string;
  childList: NaverCategoryResponse[];
};

/**
 * 네이버 데이터 렙에 있는 카테고리 정보를 읽어 온다.
 * @param cid 카테고리 ID
 * @returns
 */
export async function getCategoriesFormNaver(cid: number) {
  try {
    const result = await retry(
      0,
      new Promise(async (resolve) => {
        const data = await axios.get<NaverCategoryResponse>(
          "https://datalab.naver.com/shoppingInsight/getCategory.naver",
          {
            params: {
              cid,
            },
            headers: {
              referer:
                "https://datalab.naver.com/shoppingInsight/sCategory.naver",
            },
          }
        );

        resolve(data);
      })
    );

    return result.result;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
