export default `#graphql

    type UpdateKwdMonitoringResult {
        state:State!
        result:[StoreKeywordRank]
    }

    type Mutation {
        updateKeywordMonitoring(storeName:String!, keyword:String!):UpdateKwdMonitoringResult!
    }
`;
