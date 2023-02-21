export default `#graphql

    type  SeeProductMonitoringResult{
        state:State!
        result:MonitoringProduct
    }

    type Query {
        seeProductMonitoring(productNo:String!):SeeProductMonitoringResult!
    }
`;
