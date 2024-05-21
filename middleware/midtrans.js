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
        const { order_id, transaction_status } = req.body;
        if (transaction_status !== 'settlement') {
            return res.send({ status: 'ok' });
        }
        
    // 2. cari dari database oderId tersebut
        const transaction = await Transaction.findById(order_id);
        
        if(!transaction) {
            throw new Error("Transaction not found")
        }
    // 3. jika ada, update status transaction menjadi paid
        transaction.status = "paid";
        const result = await Transaction.updateTransaction(transaction);

    // 4. ambil userId dari transaction tersebut
        const userId = transaction.userId;

    // 5. update credit pada user tersebut ditambah menjadi 10 jika berhasil terisi setiap 50000
        const user = await User.updateCredit(userId, 10);

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