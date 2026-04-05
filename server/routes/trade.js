const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { getStockPrice } = require("../services/marketService");

// ===================== BUY =====================
router.post("/buy", auth, async (req, res) => {
  try {
    const {
      symbol,
      quantity,
      orderType = "MARKET",
      limitPrice,
      stopLoss = null,
      takeProfit = null
    } = req.body;

    // ✅ VALIDATION
    if (!symbol || quantity <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const stock = await getStockPrice(symbol);
    if (!stock) return res.status(404).json({ error: "Price unavailable" });

    // ================= LIMIT ORDER =================
    if (orderType === "LIMIT") {
      if (!limitPrice) {
        return res.status(400).json({ error: "Limit price required" });
      }

      if (stock.price > limitPrice) {
        // 🔥 SAVE PENDING ORDER
        user.orders = user.orders || [];
        user.orders.push({
          symbol,
          quantity,
          type: "LIMIT",
          limitPrice,
          status: "PENDING"
        });

        await user.save();

        return res.json({
          message: "Order placed (waiting for price)",
          status: "PENDING"
        });
      }
    }

    // ================= EXECUTE BUY =================
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

      if (stopLoss) existing.stopLoss = stopLoss;
      if (takeProfit) existing.takeProfit = takeProfit;

    } else {
      user.holdings.push({
        symbol,
        quantity,
        avgPrice: stock.price,
        stopLoss,
        takeProfit
      });
    }

    user.tradeHistory.push({
      type: "BUY",
      symbol,
      quantity,
      price: stock.price,
      stopLoss,
      takeProfit,
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


// ===================== SELL =====================
router.post("/sell", auth, async (req, res) => {
  try {
    const { symbol, quantity, notes, tags, emotion, rating } = req.body;

    // ✅ VALIDATION
    if (!symbol || quantity <= 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const holding = user.holdings.find(h => h.symbol === symbol);

    if (!holding || holding.quantity < quantity) {
      return res.status(400).json({ error: "Not enough shares" });
    }

    const stock = await getStockPrice(symbol);
    if (!stock) return res.status(404).json({ error: "Price unavailable" });

    const sellPrice = stock.price;
    const pl = (sellPrice - holding.avgPrice) * quantity;

    user.balance += sellPrice * quantity;
    holding.quantity -= quantity;

    if (holding.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    user.tradeHistory.push({
      type: "SELL",
      symbol,
      quantity,
      price: sellPrice,
      pl,
      notes,
      tags,
      emotion,
      rating,
      date: new Date()
    });

    await user.save();

    res.json({ message: "Stock sold successfully", pl });

  } catch (err) {
    console.error("SELL ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;