const { database } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const { hashPassword, validatePassword } = require("../helpers/bcrypt");
const { createToken } = require("../helpers/jwt");

class User {
    static collection() {
        return database.collection("users");
    }

    static async findById(id) {
        const userId = new ObjectId(String(id));
        // console.log(userId);

        const user = await this.collection().aggregate([
            {
                '$match': {
                    '_id': userId
                }
            },
            {
                '$lookup': {
                    'from': 'stories',
                    'localField': 'userId',
                    'foreignField': 'userId',
                    'as': 'stories'
                }
            },
            {
                '$project': {
                    'password': 0
                }
            }
        ]).toArray();

        // console.log(user);

        return user[0];
    }

    static async findByUsername(username) {
        const user = await this.collection().findOne({ username });
        return user;
    }

    static async findByEmail(email) {
        const user = await this.collection().findOne({ email });
        return user;
    }

    static async addUser(newUser) {
        const { email, username, password } = newUser;
        const user = await this.collection().insertOne({
            email,
            username,
            password,
            credit : 0
        });

        return {
            _id: user.insertedId,
            ...newUser
        };
    }

    static async loginUser(login) {
        const { username, password } = login;
    
        const user = await this.collection().findOne({ username });

        if (!user) {
            throw new Error("User not registered")
        };

        const isValidPassword = validatePassword(password, user.password);

        if (!isValidPassword) {
            throw new Error("Invalid password")
        }

        const token = createToken({
            _id : user._id
        });

        return {
            access_token : token
        };
    }

    static async updateProfile(userId, profile) {
        const { email, username, imageUrl } = profile;
        const result = await this.collection().updateOne(
          { _id: new ObjectId(String(userId)) },
          { $set: { email, username, imageUrl } }
        );
        return result.modifiedCount > 0;
      }

    // static async topUpCredit(userId, amount) {
    //     const result = await this.collection().updateOne(
    //         { _id: new ObjectId(String(userId)) },
    //         { $inc: { credit: amount } }
    //     );

    //     return result.modifiedCount > 0;
    // }

    static async updateCredit(userId, amount) {
        const result = await this.collection().updateOne(
            { _id: new ObjectId(String(userId)) },
            { $inc: { credit: amount } }
        );
        
        return result.modifiedCount > 0;
        
    }
}

module.exports = User;
