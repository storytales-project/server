import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";
import { hashPassword, validatePassword } from "../helpers/bcrypt";


export default class User {
    static collection() {
        return database.collection("users");
    };

    static async addUser(newUser) {

    }

    static async loginUser(login) {

    }    
};