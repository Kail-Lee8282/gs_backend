export default `#graphql

    type AddProductMonitoringKeyword {
        state:State!
        result:MonitoringKeywordRank
    }

    type Mutation {
        addProductMonitoringKeyword(productNo:String!,keyword:String!):AddProductMonitoringKeyword
    }
`;
