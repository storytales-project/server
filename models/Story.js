const { ObjectId } = require("mongodb");
const { database } = require("../config/mongodb");
const { generateStory, continueStory } = require("../helpers/openai");
const User = require("./User");

class Story {
    static collection() {
        return database.collection("stories");
    };

    static async getById(id) {
        const story = await this.collection().findOne({
            _id: new ObjectId(String(id)),
        });

        return story;
    };

    static async getPublic() {
        const agg = [
            {
                $match: {
                    public: true,
                },
            },
        ];

        const stories = await this.collection().aggregate(agg).toArray();
        return stories;
    };

    static async getOwned(id) {
        const agg = [
            {
                $match: {
                    userId: id,
                },
            },
        ];

        const stories = await this.collection().aggregate(agg).toArray();
        return stories;
    };

    static async getChoices(storyId) {
        const story = await this.collection().findOne({
            _id: new ObjectId(String(storyId)),
        });

        if (story.pages.length === 3) {
            throw new Error("Story has been finished");
        }

        const currentPage = story.pages[story.pages.length - 1];
        const choices = currentPage.choices;

        return choices;
    };

    static async addStory(newStory) {
        try {
            const stories = this.collection();
            const { character, mood, theme, title, language, userId } =
                newStory;

            const story = await generateStory({
                character,
                mood,
                theme,
                title,
                language,
            });

            const insert = {
                title: title,
                image: story.imageURL,
                description : story.description,
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

            await User.spendCredit(userId);

            insert._id = result.insertedId;

            return insert;
        } catch (error) {
            console.log(error);
        }
    };

    static async continueStory(pick, user) {
        try {
            const stories = this.collection();
            const story = await this.getById(pick.storyId);
            const pages = story.pages;

            if (String(story.userId) !== String(user._id)) {
                console.log(String(story.userId), String(user._id), "<<<<<<");
                throw new Error("You are not authorized");
            }

            const newPage = await continueStory(pick, pages);

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
        } catch (error) {
            console.log(error);
            throw(error);
        }
    };

    static async addLike(user, postId) {
        const stories = this.collection();
        const story = await this.getById(postId);

        const newLike = {
            userId: user._id,
            username: user.username,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await stories.updateOne(
            { _id: story._id },
            {
                $push: {
                    likes: newLike,
                },
            }
        );

        return newLike;
    };

    static async setPublic(storyId, user) {
        try {
            const stories = this.collection();
            const story = await this.getById(storyId);

            if (String(story.userId) !== String(user._id)) {
                console.log(String(story.userId), String(user._id), "<<<<<<");
                throw new Error("You are not authorized");
            };

            if (story.public === true) {
                throw new Error("Story already public");
            }


            const result = await stories.updateOne(
                {_id: new ObjectId(String(storyId))},
                {$set : { public : true}}
            );


            const updated = this.getById(storyId);

            return updated;
        } catch (error) {
            console.log(error);
            throw(error);
        }
    }
}

module.exports = Story;
