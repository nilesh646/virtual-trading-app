const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// BUY STOCK
router.post("/buy", auth, async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    const user = await User.findById(req.userId);

    const price = Math.floor(Math.random() * 100) + 200; // mock price
    const cost = price * quantity;

    if (user.balance < cost) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const stock = user.holdings.find(h => h.symbol === symbol);

    if (stock) {
      stock.avgPrice =
        (stock.avgPrice * stock.quantity + price * quantity) /
        (stock.quantity + quantity);
      stock.quantity += quantity;
    } else {
      user.holdings.push({ symbol, quantity, avgPrice: price });
    }

    user.balance -= cost;

    user.tradeHistory.push({
      type: "BUY",
      symbol,
      quantity,
      price
    });

    await user.save();
    res.json({ message: "Stock bought" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// SELL STOCK
router.post("/sell", auth, async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    const user = await User.findById(req.userId);
    const stock = user.holdings.find(h => h.symbol === symbol);

    if (!stock || stock.quantity < quantity) {
      return res.status(400).json({ error: "Not enough shares" });
    }

    const price = Math.floor(Math.random() * 100) + 200; // mock price
    const revenue = price * quantity;

    stock.quantity -= quantity;
    if (stock.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    user.balance += revenue;

    user.tradeHistory.push({
      type: "SELL",
      symbol,
      quantity,
      price
    });

    await user.save();
    res.json({ message: "Stock sold" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;