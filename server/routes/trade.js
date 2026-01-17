const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { getStockPrice } = require("../services/marketService");

// BUY
router.post("/buy", auth, async (req, res) => {
  try {
    console.log("REQ.USERID:", req.userId);

    const user = await User.findById(req.userId);
    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // continue normally...


    const cost = stock.price * quantity;

    if (user.balance < cost) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // 🔁 Check if already holding
    const holding = user.holdings.find(h => h.symbol === symbol);

    if (holding) {
      const totalQty = holding.quantity + quantity;
      holding.avgPrice =
        (holding.avgPrice * holding.quantity + stock.price * quantity) /
        totalQty;
      holding.quantity = totalQty;
    } else {
      user.holdings.push({
        symbol,
        quantity,
        avgPrice: stock.price
      });
    }

    user.balance -= cost;

    user.tradeHistory.push({
      type: "BUY",
      symbol,
      quantity,
      price: stock.price
    });

    await user.save();

    res.json({ message: "Buy successful" });
  } catch (err) {
    console.error("BUY ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});


// SELL
router.post("/sell", auth, async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    const user = await User.findById(req.userId);
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