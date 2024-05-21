const Story = require('../models/Story');

const typeDefs = `#graphql
    type Like {
        userId : ID
        username : String
        createdAt : String
        updatedAt : String
    }

    type Page {
        chapter : String
        content : String
        audio : String
        choices : [String]
    }

    type Story {
        _id : ID
        title : String
        image : String
        pages : [Page]
        character : String
        mood : String
        likes : [Like]
        public : Boolean
        theme : String
        userId : String
    }

    type Query {
        getMyStories : [Story]
        getPublicStories : [Story]
        getFavouriteStories : [Story]
        getStoryById(id : ID) : Story
        getStoryChoices(id : ID) : [String]
    }

    input NewStory {
        character : String
        mood : String
        theme : String
        title : String
        language : String
    }

    input storyPick {
        storyId : ID
        choice : String
    }

    type Mutation {
        addStory(newStory : NewStory) : Story
        continueStory(pick : storyPick) : Page
        addLike(postId : ID) : Like
    }
`;

const resolvers = {
    Query : {
        getStoryById : async (_, args) => {
            const {id} = args;

            const story = await Story.getById(id);

            return story;
        },
        getPublicStories : async () => {
            const stories = await Story.getPublic();

            return stories;
        },
        getMyStories : async (_, args, contextValue) => {
            const user = await contextValue.authentication();

            const stories = await Story.getOwned(user._id);

            return stories;
        },
        getStoryChoices : async (_, args, contextValue) => {
            const {id} = args;

            const choices = await Story.getChoices(id);

            return choices;
        }
    },
    Mutation: {
        addStory : async (_, args, contextValue) => { 
            const user = await contextValue.authentication();
            const {newStory} = args;

            if (!user) {
                throw new Error("You must login first!")
            }


            if (!newStory.character || !newStory.mood || !newStory.theme || !newStory.title || !newStory.language) {
                throw new Error("You must fill all the content!")
            };

            newStory.userId = user._id;

            const result = await Story.addStory(newStory);

            return result;
        },
        continueStory : async (_, args, contextValue) => {
            // Nanti tambahin authorization
            const user = await contextValue.authentication();

            const {pick} = args;

            const result = await Story.continueStory(pick);

            return result;
        },
        addLike : async (_, args, contextValue) => {
            const user = await contextValue.authentication();
            
            const {postId} = args;

            const newLike = await Story.addLike(user, postId);

            return newLike;
        }
    },
};

module.exports = { typeDefs, resolvers };
