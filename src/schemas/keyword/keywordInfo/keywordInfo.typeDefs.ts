export default `#graphql

    type ProductCategory {
        category1:String
        category2:String
        category3:String
        category4:String
        categoryCid1:Int
        categoryCid2:Int
        categoryCid3:Int
        categoryCid4:Int
        fullCategory:String
        percent:Int
    }

    type KeywordStaticsData{
        series:String
        value:Int
    }

    type KeywordInfo {
        keyword: String
        cid:Int
        isSeason: Boolean
        isAdult: Boolean
        isRestricted: Boolean
        isSellProhibit: Boolean
        isLowSearchVolume: Boolean
        totalSeller: Int
        loPrice: Int
        hiPrice: Int
        avgPrice: Int
        brandPercent: Int
        totalSearch: Int
        totalPurchaseCnt:Int
        competitionRate: String
        productImg: String
        category: [ProductCategory]
        searchVolumeByMonth:[KeywordStaticsData]
    }

`;
