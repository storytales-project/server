require("dotenv").config();
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");
const { typeDefs: typeDefsUser, resolvers: resolversUser } = require("./schema/user");
const { typeDefs : typeDefsStory, resolvers : resolversStory } = require("./schema/story");
const { database } = require("./config/mongodb");
const { verifyToken } = require("./helpers/jwt");
const User = require('./models/User');

const server = new ApolloServer({
    typeDefs: [typeDefsUser, typeDefsStory],
    resolvers: [resolversUser, resolversStory],
    introspection: true
})

startStandaloneServer(server, {
    listen: {
        port: process.env.PORT || 4000
    },
    context: async ({ req, res }) => {
        return {
            authentication: async () => {
                const access_token = req.headers.authorization;

                if (!access_token) {
                    throw new GraphQLError("Authorization token is missing", {
                        extensions: {
                            code: "UNAUTHORIZED"
                        }
                    })
                }
                const token = access_token.split(" ")[1];
                const payload = verifyToken(token);

                const user = await User.findById(payload._id);

                return user;
            }
        }
    }
}).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
})
.catch(err => {
    console.error(err);
})