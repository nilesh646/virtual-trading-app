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
// SELL STOCK
router.post("/sell", auth, async (req, res) => {
  const { symbol, quantity } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const holding = user.holdings.find(h => h.symbol === symbol);
    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ error: "Not enough shares" });
    }

    const sellPrice = holding.avgPrice; // OR live price if you want
    const realizedPL = (sellPrice - holding.avgPrice) * quantity;

    // Update balance
    user.balance += sellPrice * quantity;

    // Update holding
    holding.quantity -= quantit
    if (holding.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    // 🔥 SAVE REALIZED P/L
    user.tradeHistory.push({
      type: "SELL",
      symbol,
      quantity,
      price: sellPrice,
      pl: Number(realizedPL.toFixed(2)),
      date: new Date()
    });

    await user.save();
    res.json({ message: "Stock sold successfully" });
  } catch (err) {
    console.error("Sell error:", err);
    res.status(500).json({ error: "Sell failed" });
  }
});


module.exports = router;