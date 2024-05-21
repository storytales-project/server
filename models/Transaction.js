const { database } = require("../config/mongodb");
const { ObjectId } = require('mongodb');

class Transaction {

    static collection() {
        return database.collection('transactions');
    }

    static async findById(id) {
        const transaction = await this.collection().findOne({
            _id: new ObjectId(String(id))
        });
        return transaction;
    }
    
    static async addTransaction(newTransaction) {
        console.log(newTransaction, "ini new transaction");
        const result = await this.collection().insertOne(newTransaction);
        return result;
    }
    
    static async create(transaction) {
        const result = await this.addTransaction(transaction);
        return result;
    }

    static async updateTransaction(transaction) {
        const result = await this.collection().updateOne(
            { _id: new ObjectId(String(transaction._id)) },
            { $set: transaction }
        );
        return result;
    }
}

module.exports = Transaction;