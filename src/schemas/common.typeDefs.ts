export default `#graphql

    type State {
        ok:Boolean!
        code:String
        message:String
    }

    type Result {
        state:State!
    }

`;
