const express = require('express');
const midtrans = require('midtrans-node');

const app = express();

const options = {
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
};

// midtrans.config(options);

app.get('/payment', (req, res) => {
    res.send('Midtrans')
});

// app.use(midtrans.middleware);

module.exports = app;