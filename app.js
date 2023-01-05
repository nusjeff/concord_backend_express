require('dotenv').config()

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const stripe = require("stripe")(process.env.STRIPE_PUBLIC_KEY);
const cors = require('cors')
const { faker } = require('@faker-js/faker')

const app = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const calculateOrderAmount = (item) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  // return faker.random.numeric(4, { allowLeadingZeros: false })
  const price = faker.random.numeric(6, { allowLeadingZeros: false })

  return price
};

app.post("/create-payment-intent", async (req, res) => {
  const { item } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(item),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

module.exports = app;
