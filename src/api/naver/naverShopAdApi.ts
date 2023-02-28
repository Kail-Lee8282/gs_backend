import { RESTDataSource } from "@apollo/datasource-rest";
import crypto from "crypto";
import promiseRetry from "promise-retry";
import { Sleep } from "../../util/sleep";

type RelKwdStat = {
  relKeyword: string;
  monthlyPcQcCnt: string;
  monthlyMobileQcCnt: string;
  monthlyAveMobileClkCnt?: string;
  monthlyAvePcCtr?: string;
  monthlyAveMobileCtr?: string;
  plAvgDepth?: string;
  compIdx?: string;
};

type ManagedKeyword = {
  keyword: string;
  managedKeyword: {
    keyword: string;
    isAdult: boolean;
    isRestricted: boolean;
    isSeason: boolean;
    isSellProhibit: boolean;
    isLowSearchVolume: boolean;
    PCPLMaxDepth: number;
  };
};

type RelKwdStatResult = {
  keywordList: RelKwdStat[];
};

const createSignauture = (now: string, method: "GET" | "POST", url: string) => {
  return crypto
    .createHmac("sha256", process.env.NAVER_SECRET_KEY)
    .update(`${now}.${method}.${url}`)
    .digest("base64");
};
export class NaverAdAPI extends RESTDataSource {
  override baseURL = "https://api.searchad.naver.com";

  requestCnt = false;
  /**
   *
   * @param hintKeywords
   * @param event
   * @param month
   * @param showDetail
   * @returns
   */
  async getRelKwdStat(
    hintKeywords: string,
    event?: number,
    month?: number,
    showDetail?: number
  ): Promise<RelKwdStatResult> {
    try {
      const now = Date.now() + "";
      const reqUri = "/keywordstool";

      const data = {
        hintKeywords,
        event: event === undefined ? "" : event + "",
        month: month === undefined ? "" : month + "",
        showDetail: showDetail === undefined ? "" : showDetail + "",
      };

      return await promiseRetry(
        (retry, number) => {
          return this.get<RelKwdStatResult>(reqUri, {
            headers: {
              "X-Timestamp": now,
              "X-API-KEY": process.env.NAVER_API_LICENSE_KEY,
              "X-Customer": process.env.NAVER_CUSTMER_ID,
              "X-Signature": createSignauture(now, "GET", reqUri),
              "Content-Type": "application/json",
            },

            params: data,
          }).catch(retry);
        },
        {
          retries: 5,
        }
      );
    } catch (e) {
      console.error(hintKeywords, "getRelKwdStat", e);
      return null;
    }
  }

  async getManagedKeywordList(keyword: string) {
    try {
      const now = Date.now() + "";
      const reqUri = "/ncc/managedKeyword";
      const data = {
        keywords: keyword,
      };

      // 서명
      const res = await this.get<ManagedKeyword[]>(reqUri, {
        headers: {
          "X-Timestamp": now,
          "X-API-KEY": process.env.NAVER_API_LICENSE_KEY,
          "X-Customer": process.env.NAVER_CUSTMER_ID,
          "X-Signature": createSignauture(now, "GET", reqUri),
          "Content-Type": "application/json",
        },

        params: data,
      });

      return res;
    } catch (e) {
      console.error("", keyword, e);
      return null;
    }
  }

  async getManagedKeyword(keyword: string) {
    try {
      // 특수문자 제외 정규식
      const reg = new RegExp(/([a-zA-Zㄱ-ㅎ가-힣0-9])/, "g");

      const kwd = keyword.match(reg).join("").toUpperCase();

      const keywordManaged = await this.getManagedKeywordList(kwd);

      const { managedKeyword } = keywordManaged.find(
        (item) => item.keyword.toUpperCase() === kwd
      );

      return managedKeyword;
    } catch (e) {
      console.error("getManagedKeyword", keyword, e);
      return null;
    }
  }
}
