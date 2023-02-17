export default `#graphql


    type Category {
         cid:Int!
         name:String
         pid:Int
         level:Int
         parent:[Category]
         children:[Category]
     }

    
     
    type CategoriesResult {
        state:State!
        result:Category
    }


    type Query {
        getCategories(cid:Int!):Category
    }

`;
