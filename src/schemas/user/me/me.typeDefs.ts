export default `#graphql

    type MeResult {
        state:State!
        result:User
    }

    type Query {
        me:MeResult!
    }
`;
