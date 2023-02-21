export default `#graphql

    type SeeKwdMonitoringResult {
        state:State!
        result:[StoreKeywordRank]
    }

    type Query {
        seeKeywordsMonitoring:SeeKwdMonitoringResult!
    }
`;
