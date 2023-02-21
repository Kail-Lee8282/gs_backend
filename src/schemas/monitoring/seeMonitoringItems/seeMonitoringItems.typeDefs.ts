export default `#graphql 


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

    type SeeProductMonitoringItemsResult {
        state:State!
        result:[MonitoringProduct]
    }

    type Query{
        seeMonitoringItems:SeeProductMonitoringItemsResult!
    }
`;
