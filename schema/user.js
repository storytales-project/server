
export const typeDefs = `#graphql
    type User {
        _id : ID 
        email : String
        username : String
        credit : Number
    }

    type Token {
        access_token : String
    }

    input NewUser {
        email : String
        username : String
        password : String
    }

    input Login {
        username : String
        password : String
    }

    type Query {
        getUserById(id : ID) : User
        getUserByUsername(username : String) : User
        getUserByEmail(email : String) : User
    }

    type Mutation {
        addUser(newUser : NewUser) : User
        loginUser(login : Login) : Token
    }
`

export const resolvers = {
    Query : {

    },
    Mutation : {

    }
};

