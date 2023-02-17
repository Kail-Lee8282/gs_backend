export default `#graphql

    type SignupResult {
        state:State!
    }

    type Mutation {
         signup(
            email:String!,
            userName:String!,
            password:String!,
            phoneNumber:String!,
        ):SignupResult
    }
`;
