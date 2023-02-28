export default `#graphql

    type SeePopularKeywordsResult {
        state:State!
        result:[PopularKeyword]
    }

    type Query {
    
        seePopularKeywords(cid:Int!, page:Int!):SeePopularKeywordsResult!
    }
`;
