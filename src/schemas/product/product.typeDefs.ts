export default `#graphql

type ProductChartData{
    series:String
    value:Int
}


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


type Product {
    name:String
    cid:Int,
    totalSeller:Int
    hiPrice:Int
    loPrice:Int
    avgPrice:Int
    totalSearch:Int
    competitionRate:String
    brandPercent:Int
    productImg:String
    isAdult:Boolean
    isLowSearchVolume: Boolean
    isRestricted: Boolean
    isSeason: Boolean
    isSellProhibit: Boolean
    trandKwdByAge:[ProductChartData]
    trandKwdByGender:[ProductChartData]
    trandKwdByDevice:[ProductChartData]
    searchVolumeByMonth:[ProductChartData]
    category:[ProductCategory]
}

`;
