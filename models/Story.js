const { database } = require("../config/mongodb");
const { generateStory } = require("../helpers/openai");

class Story {
    static collection() {
        return database.collection('stories');
    };

    static async addStory(newStory) {
        const stories = this.collection();
        const {character, mood, theme, title, language, userId} = newStory;

        const story = await generateStory({character, mood, theme, title, language});

        console.log(story);

        const insert = {
            title : title,
            image : story.imageURL,
            pages : [
                {
                    chapter : story.chapter,
                    content : story.story,
                    audio : story.audioURL,
                    choices : story.choices
                }
            ],
            character : character,
            mood : mood,
            likes : [],
            public : false,
            theme : theme,
            userId : userId
        }

        const result = await stories.insertOne(insert)

        insert._id = result.insertedId;

        return insert;
    }
};

module.exports = Story;