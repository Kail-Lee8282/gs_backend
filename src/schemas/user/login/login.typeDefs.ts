export default `#graphql

    type LoginResult {
        state:State!
        token:String
    }

    type Mutation {
        login(email:String!, password:String!):LoginResult!
    }
`;
