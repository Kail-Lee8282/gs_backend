export default `#graphql

    type  seeMonitoringItemResult{
        state:State!
        result:MonitoringProduct
    }

    type Query {
        seeMonitoringItem(productNo:String!):seeMonitoringItemResult!
    }
`;
