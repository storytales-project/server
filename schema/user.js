const { GraphQLError }  = require("graphql");
const User = require("../models/User");
const { hashPassword, validatePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");

const typeDefs = `#graphql
    type User {
        _id : ID 
        email : String
        username : String
        credit : Int
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

const resolvers = {
    Query : {
            getUserById: async (_, args) => {
            try {
                const user = await User.findById(args.id);
                return user;
            } catch (error) {
                throw error
            }
        },

        getUserByUsername: async (_, args) => {
            try {
                const user = await User.findByUsername(args.username);
                return user;
            } catch (error) {
                throw error
            }
        },

        getUserByEmail: async (_, args) => {
            try {
                const user = await User.findByEmail(args.email);
                return user;
            } catch (error) {
                throw error
            }
        }
    },

    Mutation : {
        addUser: async (_, args) => {
            try {
                const { email, username, password } = args.newUser;
        
                if (!email) {
                    throw new GraphQLError("Email is required", {
                        extensions: {
                            code: "BAD_REQUEST"
                        }
                    });
                }
        
                if (!username) {
                    throw new GraphQLError("Username is required", {
                        extensions: {
                            code: "BAD_REQUEST"
                        }
                    });
                }
        
                if (!password) {
                    throw new GraphQLError("Password is required", {
                        extensions: {
                            code: "BAD_REQUEST"
                        }
                    });
                }
        
                const validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/;
        
                if (!email.match(validEmail)) {
                    throw new GraphQLError("Email must be formatted (example@mail.com)", {
                        extensions: {
                            code: "BAD_REQUEST"
                        }
                    });
                }
        
                if (password.length < 5) {
                    throw new GraphQLError("Password must be at least 5 characters", {
                        extensions: {
                            code: "BAD_REQUEST"
                        }
                    });
                }
        
                const userFound = await User.findByEmail(email);
        
                if (userFound) {
                    throw new GraphQLError("Email already in use", {
                        extensions: {
                            code: "BAD_REQUEST"
                        }
                    });
                }
        
                const user = { email, username, password };
        
                user.password = hashPassword(user.password);
                console.log(user.password)
                let result = await User.addUser(user);
        
                return result;
            } catch (error) {
                throw error;
            }
        },

        loginUser: async (_, args) => {
            try {
                const token = await User.loginUser(args.login);
                return token;
            } catch (error) {
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: "UNAUTHORIZED"
                    }
                });
            }
        }
    }
};

module.exports = { typeDefs, resolvers };

