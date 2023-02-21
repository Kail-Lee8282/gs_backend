export default `#graphql

    type UpdateProductRankResut {
        state:State!
        result:MonitoringKeywordRank
    }

    type Mutation {
        updateProductRank(id:String!):UpdateProductRankResut!
    }
`;
