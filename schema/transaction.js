const { GraphQLError } = require("graphql");
const Transaction = require("../models/Transaction");

const typeDefs = `#graphql
    type Transaction {
        _id: ID
        userId: ID
        credit: Int
    }

    input CreateTransaction {
        userId: ID
        credit: Int
    }

    type Query {
        getTransactions: [Transaction]
    }

    type Mutation {
        addTransaction(newTransaction: CreateTransaction!): Transaction
    }
`;

const resolvers = {
    Query: {
        getTransactions: async () => {
            try {
                const transactions = await Transaction.find();
                return transactions;
            } catch (error) {
                throw new GraphQLError(error.message);
            }
        }
    },

    Mutation: {
        addTransaction: async (_, { newTransaction }) => {
          try {
            const transaction = await Transaction.create(newTransaction);
            return transaction;
          } catch (error) {
            throw new GraphQLError(error.message);
          }
        }
    }
};

module.exports = { typeDefs, resolvers };