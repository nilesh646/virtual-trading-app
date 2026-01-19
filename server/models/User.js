const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 100000
  },
  holdings: [
    {
      symbol: String,
      quantity: Number,
      avgPrice: Number
    }
  ],
  tradeHistory: [
  {
    type: {
      type: String, // BUY or SELL
      required: true
    },
    symbol: String,
    quantity: Number,
    price: Number,
    pnl: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    }
  }
]
});

module.exports = mongoose.model("User", userSchema);