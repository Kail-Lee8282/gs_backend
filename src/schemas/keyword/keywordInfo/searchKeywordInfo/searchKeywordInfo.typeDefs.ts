export default `#graphql
    
    type SearchKeywordInfoResult {
        state:State!
        result:KeywordInfo
    }
    type Mutation {
    
        searchKeywordInfo(keyword:String!):SearchKeywordInfoResult!
    }

`;
