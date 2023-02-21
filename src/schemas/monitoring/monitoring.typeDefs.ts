export default `#graphql

    type MonitoringKeywordRank {
        date: String
        index: Int
        page: Int
        rank: Int
        adIndex:Int
        adPage:Int
        adRank:Int
        id: String
        updateAt: String
    }


    type Query {
        getProductDisplayLocation:Result!
    }
`;
