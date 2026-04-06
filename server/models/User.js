const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    /* ================= WALLET ================= */
    balance: {
      type: Number,
      default: 100000
    },

    watchlist: {
      type: [String],
      default: []
    },

    /* ================= HOLDINGS ================= */
    holdings: [
      {
        symbol: { type: String, required: true },
        quantity: { type: Number, default: 0 },
        avgPrice: { type: Number, default: 0 },

        stopLoss: { type: Number, default: 0 },
        takeProfit: { type: Number, default: 0 }
      }
    ],

    /* ================= ORDERS ================= */
    orders: [
      {
        symbol: String,
        quantity: Number,
        type: { type: String, enum: ["BUY", "SELL"] },

        orderType: { type: String, enum: ["MARKET", "LIMIT"] },
        limitPrice: Number,

        status: {
          type: String,
          enum: ["PENDING", "EXECUTED", "CANCELLED"],
          default: "PENDING"
        },

        date: { type: Date, default: Date.now }
      }
    ],

    /* ================= TRADE HISTORY ================= */
    tradeHistory: [
      {
        type: { type: String }, // BUY / SELL
        symbol: String,
        quantity: Number,
        price: Number,
        pl: Number,
        date: { type: Date, default: Date.now },

        // 🧾 Journal
        notes: { type: String, default: "" },
        tags: { type: [String], default: [] },

        // 🧠 Behavior tracking
        emotion: { type: String, default: "" },
        rating: { type: Number, default: 0 }
      }
    ]
  },
  {
    timestamps: true // 🔥 createdAt, updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);