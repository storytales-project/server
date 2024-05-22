const {database} = require("../config/mongodb");
const { ObjectId } = require("mongodb");

class Favorite {
    static collection() {
        return database.collection("favorites");
    };

    static async addFavorite(storyId, user) {
        const favorites = this.collection();

        const isFavorited = await favorites.findOne({
            storyId : new ObjectId(String(storyId)),
            userId : user._id
        });

        if (isFavorited) {
            throw new Error("User already liked the story")
        };

        const newFavorite = {
            username : user.username,
            userId : user._id,
            storyId : new ObjectId(String(storyId)),
            createdAt : new Date(),
            updatedAt : new Date()
        }

        const result = await favorites.insertOne(newFavorite);

        return newFavorite;
    };
};

module.exports = Favorite;