const Favorite = require("../models/Favorite");

const typeDefs = `#graphql

    type User {
        _id : ID 
        email : String
        username : String
        credit : Int
    }

    type Story {
        _id : ID
        title : String
        image : String
        description : String
        pages : [Page]
        character : String
        mood : String
        public : Boolean
        theme : String
        userId : String
    }

    type Favorite {
        _id : ID
        username : String
        userId : ID
        storyId : ID
        story : Story
        createdAt : String
        updatedAt : String
    }

    type Query {
        getUserFavorites : [Favorite]
    }

    type Mutation {
        addFavorite(storyId : ID) : Favorite
    }
`

const resolvers = {
    Query : {
        getUserFavorites : async (_, args, contextValue) => {
            const user = await contextValue.authentication();

            const result = await Favorite.getUserFavorites(user);

            return result;
        }
    },
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