export default `#graphql
    
    

    type PopularKeyword {
        rank:Int
        keyword:String
        kwdCategoryName: String
        monthlyClickCnt:Int
        productCnt:Int
        cid:Int
    }

    type seePopularKwdResult {
        state:State!
        data:[PopularKeyword]
        
    }

    type Query {
        seePopularKwd(cid:Int!, keyword:String):seePopularKwdResult!
    }
`;
