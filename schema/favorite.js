const Favorite = require("../models/Favorite");

const typeDefs = `#graphql
    type Favorite {
        _id : ID
        username : String
        userId : ID
        storyId : ID
        createdAt : String
        updatedAt : String
    }

    type Mutation {
        addFavorite(storyId : ID) : Favorite
    }
`

const resolvers = {
    Mutation : {
        addFavorite : async (_, args, contextValue) => {
            const user = await contextValue.authentication();

            const {storyId} = args;

            const result = await Favorite.addFavorite(storyId, user);

            return result
        }
    }
};

module.exports = {typeDefs, resolvers};