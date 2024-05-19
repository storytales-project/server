const { ObjectId } = require("mongodb");
const { database } = require("../config/mongodb");
const { generateStory, continueStory } = require("../helpers/openai");

class Story {
    static collection() {
        return database.collection("stories");
    }

    static async getById(id) {
        const story = await this.collection().findOne({
            _id: new ObjectId(String(id)),
        });

        return story;
    }

    static async getPublic() {
        const agg = [
            {
                "$match": {
                    "public" : true,
                },
            },
        ];

        const stories = await this.collection().aggregate(agg).toArray();
        return stories;
    }

    static async getOwned(id) {
        const agg = [
            {
                "$match": {
                    "userId" : id,
                },
            },
        ];

        const stories = await this.collection().aggregate(agg).toArray();
        return stories;
    }

    static async addStory(newStory) {
        const stories = this.collection();
        const { character, mood, theme, title, language, userId } = newStory;

        const story = await generateStory({
            character,
            mood,
            theme,
            title,
            language,
        });

        console.log(story);

        const insert = {
            title: title,
            image: story.imageURL,
            pages: [
                {
                    chapter: story.chapter,
                    content: story.story,
                    audio: story.audioURL,
                    choices: story.choices,
                },
            ],
            character: character,
            mood: mood,
            likes: [],
            public: false,
            theme: theme,
            userId: userId,
        };

        const result = await stories.insertOne(insert);

        insert._id = result.insertedId;

        return insert;
    }

    static async continueStory(pick) {
        const stories = this.collection();
        const story = await this.getById(pick.storyId);
        const pages = story.pages;

        const newPage = await continueStory(pick, pages);

        console.log(newPage);

        const result = await stories.updateOne(
            { _id: story._id },
            {
                $push: {
                    pages: {
                        chapter: newPage.chapter,
                        content: newPage.content,
                        audio: newPage.audio,
                        choices: newPage.choices,
                    },
                },
            }
        );

        return newPage;
    }
}

module.exports = Story;
