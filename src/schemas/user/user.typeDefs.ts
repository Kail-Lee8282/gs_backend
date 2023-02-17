export default `#graphql

    type Grade{
        code:String
        gradeName:String
        gradeDesc:String
        level:Int
    }

    type User {
        id:String
        email:String
        userName:String
        password:String
        phoneNum:String
        grade:Grade
        createdAt:String
        update:String
    }
`;
