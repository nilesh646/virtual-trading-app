const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { getStockPrice } = require("../services/marketService");

// BUY
router.post("/buy", auth, async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const stock = await getStockPrice(symbol);

    if (!stock) {
      return res.status(400).json({ error: "Invalid stock symbol" });
    }

    const cost = stock.price * quantity;

    if (user.balance < cost) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    user.balance -= cost;

    const holding = user.holdings.find(h => h.symbol === symbol);

    if (holding) {
      holding.avgPrice =
        (holding.avgPrice * holding.quantity + cost) /
        (holding.quantity + quantity);
      holding.quantity += quantity;
    } else {
      user.holdings.push({
        symbol,
        quantity,
        avgPrice: stock.price
      });
    }

    user.tradeHistory.push({
      type: "BUY",
      symbol,
      quantity,
      price: stock.price
    });

    await user.save();
    res.json({ message: "Buy successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// SELL
router.post("/sell", auth, async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const holding = user.holdings.find(h => h.symbol === symbol);

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ error: "Not enough shares to sell" });
    }

    const stock = await getStockPrice(symbol);
    const revenue = stock.price * quantity;

    holding.quantity -= quantity;
    user.balance += revenue;

    if (holding.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    user.tradeHistory.push({
      type: "SELL",
      symbol,
      quantity,
      price: stock.price
    });

    await user.save();
    res.json({ message: "Sell successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;