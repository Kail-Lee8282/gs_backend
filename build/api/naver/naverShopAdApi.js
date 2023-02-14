import { RESTDataSource } from "@apollo/datasource-rest";
import crypto from "crypto";
const createSignauture = (now, method, url) => {
    return crypto
        .createHmac("sha256", process.env.NAVER_SECRET_KEY)
        .update(`${now}.${method}.${url}`)
        .digest("base64");
};
export class NaverAdAPI extends RESTDataSource {
    constructor() {
        super(...arguments);
        this.baseURL = "https://api.searchad.naver.com";
        this.requestCnt = false;
    }
    /**
     *
     * @param hintKeywords
     * @param event
     * @param month
     * @param showDetail
     * @returns
     */
    async getRelKwdStat(hintKeywords, event, month, showDetail) {
        try {
            if (this.requestCnt) {
                await new Promise((r) => setTimeout(r, 300));
                return this.getRelKwdStat(hintKeywords, event, month, showDetail);
            }
            else {
                this.requestCnt = true;
                const now = Date.now() + "";
                const reqUri = "/keywordstool";
                const data = {
                    hintKeywords,
                    event: event === undefined ? "" : event + "",
                    month: month === undefined ? "" : month + "",
                    showDetail: showDetail === undefined ? "" : showDetail + "",
                };
                await new Promise((r) => setTimeout(r, 300));
                // 서명
                const res = await this.get(reqUri, {
                    headers: {
                        "X-Timestamp": now,
                        "X-API-KEY": process.env.NAVER_API_LICENSE_KEY,
                        "X-Customer": process.env.NAVER_CUSTMER_ID,
                        "X-Signature": createSignauture(now, "GET", reqUri),
                        "Content-Type": "application/json",
                    },
                    params: data,
                });
                this.requestCnt = false;
                return res;
            }
        }
        catch (e) {
            console.error(hintKeywords, "getRelKwdStat", e);
            return null;
        }
    }
    async getManagedKeywordList(keyword) {
        try {
            const now = Date.now() + "";
            const reqUri = "/ncc/managedKeyword";
            const data = {
                keywords: keyword,
            };
            // 서명
            const res = await this.get(reqUri, {
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
        }
        catch (e) {
            console.error("", keyword, e);
            return null;
        }
    }
    async getManagedKeyword(keyword) {
        try {
            // 특수문자 제외 정규식
            const reg = new RegExp(/([a-zA-Zㄱ-ㅎ가-힣0-9])/, "g");
            const kwd = keyword.match(reg).join("").toUpperCase();
            const keywordManaged = await this.getManagedKeywordList(kwd);
            const { managedKeyword } = keywordManaged.find((item) => item.keyword.toUpperCase() === kwd);
            return managedKeyword;
        }
        catch (e) {
            console.error("getManagedKeyword", keyword, e);
            return null;
        }
    }
}
