export default `#graphql

    type SeeProductResult {
        state:State!
        result:Product
    }

    type Query {
        seeProduct(keyword:String!):SeeProductResult!
    }
`;
