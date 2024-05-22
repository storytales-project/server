const { GraphQLError } = require("graphql");
const User = require("../models/User");
const { hashPassword, validatePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");
const midtransClient = require('midtrans-client');
const Transaction = require("../models/Transaction");

const typeDefs = `#graphql
    type User {
        _id : ID 
        email : String
        username : String
        credit : Int
        imageUrl : String
    }

    type Token {
        access_token : String
    }

    input NewUser {
        email : String
        username : String
        password : String
        imageUrl : String
    }

    input Login {
        username : String
        password : String
    }

    input TopUpCredit {
        credit : Int
    }

    type Query {
        getUserById(id : ID) : User
        getUserByUsername(username : String) : User
        getUserByEmail(email : String) : User
        getProfile : User
    }

    type Mutation {
        addUser(newUser : NewUser) : User
        loginUser(login : Login) : Token
        updateProfile(profile : NewUser) : String
        topUpCredit : String
    }
`;

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
        },
        
        getProfile: async (_, args, contextValue) => {
            try {
                const user = await contextValue.authentication();
                const userId = user._id;
                const profile = await User.findById(userId);
                return profile;
            } catch (error) {
                throw error;
            }
        }
    },

    Mutation: {
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
                // console.log(user.password)
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
        },

        updateProfile: async (_, args, contextValue) => {
            try {
              const user = await contextValue.authentication();
              const userId = user._id;
              const { profile } = args;
              const { email, username, imageUrl } = profile;
            //   console.log(profile, "ini profile");
              const update = await User.updateProfile(
                userId,
                { email, username, imageUrl }
              );
              return update;
            } catch (error) {
              throw error;
            }
          },

        topUpCredit: async (_, args, contextValue) => {

            // 1. ambil userId dari headers
            // 2. masukan transaction ke database(userId, amount, status)
            // 3. id dari poin kedua kirim ke midtrans sebagai order_id
            // 4. return redirectUrl

            let snap = new midtransClient.Snap({
                isProduction: false,
                serverKey: process.env.MIDTRANS_SERVER_KEY,
                clientKey: process.env.MIDTRANS_CLIENT_KEY
            });
        
            const user = await contextValue.authentication();
            // console.log(user, "ini user");

            const userId = user._id;
            // console.log(userId, "ini userId");

            const newTransaction = { userId, amount: 50000, status: "unpaid"}

            const transaction = await Transaction.addTransaction(newTransaction);

            const orderId = transaction.insertedId;
        
            if (!transaction) {
                throw new Error("Transaction not found");
            }
        
            let parameter = {
                "transaction_details": {
                    "order_id": orderId,
                    "gross_amount": newTransaction.amount
                },
                "credit_card": {
                    "secure": true
                }
            };
        
            const createdTransaction = await snap.createTransaction(parameter);
            // console.log("Success", createdTransaction);
            let redirectUrl = createdTransaction.redirect_url;
            // console.log('redirectUrl:', redirectUrl);
        
            return redirectUrl;
        }
    }
};

module.exports = { typeDefs, resolvers };
