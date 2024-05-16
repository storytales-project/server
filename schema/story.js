
const typeDefs = `#graphql
    type Like {
        userId : ID
        username : String
        storyId : ID
        createdAt : String
        updatedAt : String
    }

    type Story {
        _id : ID
        title : String
        content : String
        audio : String
        image : String
        character : String
        mood : String
        likes : [Like]
        public : Boolean
        themeId : String
        userId : String
    }

    type Query {
        getMyStories : [Story]
        getPublicStories : [Story]
        getFavouriteStories : [Story]
        getStoryById : Story
    }

    input NewStory {
        character : String
        mood : String
        theme : String
        title : String
    }

    input NewLike {
        postId : ID
    }

    type Mutation {
        addStory(newStory : NewStory) : Story
        addLike(newLike : NewLike) : Like
    }
`

const resolvers = {

};

module.exports = {typeDefs, resolvers};