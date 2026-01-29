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
      avgPrice: Number,
      stopLoss: Number,     // NEW
      takeProfit: Number    // NEW
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
    pl: {
      type: Number,
      default: 0
    },
    date: {
      type: Date,
      default: Date.now
    },
    
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },

  }
]
});

module.exports = mongoose.model("User", userSchema);