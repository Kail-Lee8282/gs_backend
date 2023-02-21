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



    type MonitoringKeyword {
        keyword: String
        id:String
        ranks:[MonitoringKeywordRank]
    }

    type MonitoringProduct {
        title: String 
        productNo: String 
        reviewCount: Int
        reviewScore: Float
        cumulationSaleCount: Int
        recentSaleCount: Int 
        storeName: String 
        salePrice: Int
        mobileSalePrice: Int
        productImageUrl: String
        productUrl:String
        wholeCategoryName:String
        searchTags:[String]
        keywords:[MonitoringKeyword]
    }

    type Query {
        getProductDisplayLocation:Result!
    }
`;
