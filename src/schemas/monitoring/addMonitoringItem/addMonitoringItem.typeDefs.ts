export default `#graphql

    type AddMonitoringItemReturn {
        id:String
    }

    type AddMonitoringItemResult {
        state:State!
        result:AddMonitoringItemReturn
    }

    type Mutation {
        addMonitoringItem(uri:String!):AddMonitoringItemResult!
    }
`;
