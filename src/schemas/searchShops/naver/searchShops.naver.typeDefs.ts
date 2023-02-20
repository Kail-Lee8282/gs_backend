export default `#graphql

    type SearchShopsResult {
        state:State!
        result: [ProductShop]
    }

    type Query{
        searchNaverShops(keyword:String!,page:Int):SearchShopsResult!
    }

`;
