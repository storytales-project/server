const { database } = require("../config/mongodb");
const { ObjectId } = require("mongodb");
const { hashPassword, validatePassword } = require("../helpers/bcrypt");

class User {
    static collection() {
        return database.collection("users");
    }

    static async findById(id) {
        const user = await this.collection().aggregate([
            {
                '$match': {
                    '_id': new ObjectId(id)
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

        return user;
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
            password
        });

        return {
            _id: user.insertedId,
            ...newUser
        };
    }

    static async loginUser(login) {
        const { username, password } = login;
    
        const user = await this.collection().findOne({ username });

        console.log(password, user.password)
    
        if (user && validatePassword(password, user.password)) {
            return user;
        } else {
            throw new Error('Invalid username or password');
        }
    }
}

module.exports = User;
