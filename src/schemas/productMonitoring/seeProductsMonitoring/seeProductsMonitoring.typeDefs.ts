export default `#graphql 


    type SeeProductsMonitoringResult {
        state:State!
        result:[MonitoringProduct]
    }

    type Query{
        seeProductsMonitoring:SeeProductsMonitoringResult!
    }
`;
