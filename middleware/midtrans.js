const express = require('express');
const midtrans = require('midtrans-node');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const router = express.Router()

const options = {
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
};


// midtrans.config(options);

router.get('/', (req, res) => {
    res.send('Midtrans')
});

router.post('/', async (req, res) => {
    try {
        // 1. cek body dari midtrans, ambil orderId
        const { orderId } = req.body;
    // 2. cari dari database oderId tersebut
        const transaction = await Transaction.findById(orderId);
        
        if(!transaction) {
            throw new Error("Transaction not found")
        }
    // 3. jika ada, update status transaction menjadi paid
        transaction.status = "paid";
        await transaction.save();
    // 4. ambil userId dari transaction tersebut
        const userId = transaction.userId;
    // 5. update credit user tersebut ditambah +10
        const user = await User.findByIdAndUpdate(userId, { $inc: { credit: 10 } });

        if(!user) {
            throw new Error("User not found")
        }
    // 6. kembalikan response data user
        res.send(user);
    } catch (error) {
        console.log(error);
        res.send(error)
    }
})
// app.use(midtrans.middleware);

module.exports = router;