const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { getStockPrice } = require("../services/marketService");
const axios = require("axios");   // 🔥 ADD THIS


// BUY
router.post("/buy", auth, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const stock = await getStockPrice(symbol); // ✅ DIRECT SERVICE CALL
    if (!stock) return res.status(404).json({ error: "Stock price unavailable" });

    const totalCost = stock.price * quantity;

    if (user.balance < totalCost) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    user.balance -= totalCost;

    const existing = user.holdings.find(h => h.symbol === symbol);
    if (existing) {
      const totalQty = existing.quantity + quantity;
      existing.avgPrice =
        (existing.avgPrice * existing.quantity + stock.price * quantity) /
        totalQty;
      existing.quantity = totalQty;
    } else {
      user.holdings.push({ symbol, quantity, avgPrice: stock.price });
    }

    user.tradeHistory.push({
      type: "BUY",
      symbol,
      quantity,
      price: stock.price,
      pl: 0,
      date: new Date()
    });

    await user.save();
    res.json({ message: "Stock bought successfully" });

  } catch (err) {
    console.error("BUY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});




// SELL STOCK
router.post("/sell", auth, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const holding = user.holdings.find(h => h.symbol === symbol);
    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ error: "Not enough shares to sell" });
    }

    const stock = await getStockPrice(symbol);
    if (!stock) return res.status(404).json({ error: "Stock price unavailable" });

    const sellPrice = stock.price;
    const buyPrice = holding.avgPrice;

    const proceeds = sellPrice * quantity;
    const pl = (sellPrice - buyPrice) * quantity;   // ✅ REAL PROFIT/LOSS

    // Add money back
    user.balance += proceeds;

    // Reduce holdings
    holding.quantity -= quantity;
    if (holding.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    // Save trade history WITH REAL PL
    user.tradeHistory.push({
      type: "SELL",
      symbol,
      quantity,
      price: sellPrice,
      pl: pl,                 // ⭐ THIS FIXES EVERYTHING
      date: new Date()
    });

    await user.save();

    res.json({ message: "Stock sold", pl });

  } catch (err) {
    console.error("SELL ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;