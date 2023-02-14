import { RESTDataSource } from "@apollo/datasource-rest";
const headers = {
    "X-Naver-Client-Id": process.env.NAVER_DEV_CLIENT_ID,
    "X-Naver-Client-Secret": process.env.NAVER_DEV_CLIENT_SECRET,
};
export class NaverDataLabAPI extends RESTDataSource {
    constructor() {
        super(...arguments);
        this.baseURL = "https://openapi.naver.com";
    }
    willSendRequest(_path, request) {
        request.headers = headers;
    }
    /**
     * 쇼핑 검색 결과 조회
     * https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md#%EC%87%BC%ED%95%91-%EA%B2%80%EC%83%89-%EA%B2%B0%EA%B3%BC-%EC%A1%B0%ED%9A%8C
     * @param query 검색어
     * @param display
     * @param start
     * @param sort
     * @param filter
     * @param exclude
     * @returns
     */
    async getShop(query, display, start, sort, filter, exclude) {
        try {
            const data = {
                query,
                display: display === undefined ? undefined : display + "",
                start: start === undefined ? undefined : start + "",
                sort,
                filter,
                exclude,
            };
            const urlParam = JSON.parse(JSON.stringify(data));
            return await this.get("/v1/search/shop.json", {
                params: urlParam,
            });
        }
        catch (e) {
            throw e;
        }
    }
    /**
     * 통합 검색어 트랜드 API
     * https://developers.naver.com/docs/serviceapi/datalab/search/search.md#%EB%84%A4%EC%9D%B4%EB%B2%84-%ED%86%B5%ED%95%A9-%EA%B2%80%EC%83%89%EC%96%B4-%ED%8A%B8%EB%A0%8C%EB%93%9C-%EC%A1%B0%ED%9A%8C
     * @param startDate
     * @returns
     */
    async getTotalKeywordTrandSearch(startDate, endDate, timeUnit, keywordGroups, device, gender, ages) {
        try {
            const data = {
                startDate,
                endDate,
                timeUnit,
                keywordGroups: [
                    {
                        groupName: keywordGroups.groupName,
                        keywords: keywordGroups.keywords && keywordGroups.keywords.length > 0
                            ? keywordGroups.keywords
                            : [keywordGroups.groupName],
                    },
                ],
                device,
                gender,
                ages,
            };
            return await this.post("/v1/datalab/search", {
                body: data,
            });
        }
        catch (e) {
            console.log("getDataLabSearch", e);
            throw e;
        }
    }
    /**
     * 쇼핑인사이트 키워드 (기기, 성별, 나이) 트랜드 조회
     * @param type
     * @param startDate
     * @param endDate
     * @param timeUnit
     * @param category
     * @param keyword
     * @param device
     * @param gender
     * @param ages
     * @returns
     */
    async getShoppingKeywordTrand(type, startDate, endDate, timeUnit, category, keyword, device, gender, ages) {
        try {
            const request = {
                body: {
                    startDate,
                    endDate,
                    timeUnit,
                    category,
                    keyword,
                    device,
                    gender,
                    ages,
                },
            };
            if (type === "age") {
                return await this.post("/v1/datalab/shopping/category/keyword/age", request);
            }
            else if (type === "device") {
                return await this.post("/v1/datalab/shopping/category/keyword/device", request);
            }
            else if (type === "gender") {
                return await this.post("/v1/datalab/shopping/category/keyword/gender", request);
            }
        }
        catch (e) {
            console.error("getShoppingKeywordTrand", e);
            throw e;
        }
    }
    /**
     * 분야별 성별 트렌드 조회
     * https://developers.naver.com/docs/serviceapi/datalab/shopping/shopping.md#%EC%87%BC%ED%95%91%EC%9D%B8%EC%82%AC%EC%9D%B4%ED%8A%B8-%EB%B6%84%EC%95%BC-%EB%82%B4-%EC%84%B1%EB%B3%84-%ED%8A%B8%EB%A0%8C%EB%93%9C-%EC%A1%B0%ED%9A%8C
     * @param startDate
     * @param endDate
     * @param timeUnit
     * @param category
     * @param device
     * @param gender
     * @param ages
     * @returns
     */
    async getShoppingCategoryGender(startDate, endDate, timeUnit, category, device, gender, ages) {
        try {
            const data = {
                startDate,
                endDate,
                timeUnit,
                category: category === undefined ? "" : category,
                device,
                gender,
                ages,
            };
            const res = await this.post("/v1/datalab/shopping/category/gender", {
                body: data,
            });
            return res;
        }
        catch (e) {
            console.error("getShoppingCategoryAge", e);
            throw e;
        }
    }
}
