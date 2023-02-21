export default `#graphql

    type AddProductMonitoringReturn {
        id:String
    }

    type AddProductMonitoringResult {
        state:State!
        result:AddProductMonitoringReturn
    }

    type Mutation {
        addProductMonitoring(uri:String!):AddProductMonitoringResult!
    }
`;
