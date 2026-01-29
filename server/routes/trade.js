const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { getStockPrice } = require("../services/marketService");


// ===================== BUY =====================
router.post("/buy", auth, async (req, res) => {
  try {
    const { symbol, quantity, stopLoss = null, takeProfit = null } = req.body;


    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const stock = await getStockPrice(symbol);
    if (!stock) return res.status(404).json({ error: "Stock price unavailable" });

    const totalCost = stock.price * quantity;

    if (user.balance < totalCost)
      return res.status(400).json({ error: "Insufficient balance" });

    user.balance -= totalCost;

    const existing = user.holdings.find(h => h.symbol === symbol);

    if (existing) {
      const totalQty = existing.quantity + quantity;
      existing.avgPrice =
        (existing.avgPrice * existing.quantity + stock.price * quantity) /
        totalQty;
      existing.quantity = totalQty;

      // 🔥 Save risk controls
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
    res.json({ message: "Stock bought with risk controls" });

  } catch (err) {
    console.error("BUY ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});



// ===================== MANUAL SELL =====================
router.post("/sell", auth, async (req, res) => {
  try {
    const { symbol, quantity, notes, tags } = req.body;

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
    const pl = (sellPrice - buyPrice) * quantity;

    user.balance += proceeds;
    holding.quantity -= quantity;

    if (holding.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    // ⭐ SAVE NOTES + TAGS
    user.tradeHistory.push({
      type: "SELL",
      symbol,
      quantity,
      price: sellPrice,
      pl,
      date: new Date(),
      notes: notes || "",
      tags: tags || []
    });

    await user.save();
    res.json({ message: "Stock sold", pl });

  } catch (err) {
    console.error("SELL ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// 🔥 AUTO SELL CHECKER
// SELL STOCK
router.post("/sell", auth, async (req, res) => {
  try {
    const { symbol, quantity, tags = [] } = req.body; // ⭐ RECEIVE TAGS

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
    const pl = (sellPrice - buyPrice) * quantity;

    user.balance += proceeds;

    holding.quantity -= quantity;
    if (holding.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    // ⭐ SAVE TAGS WITH TRADE
    user.tradeHistory.push({
      type: "SELL",
      symbol,
      quantity,
      price: sellPrice,
      pl,
      tags,          // 🔥 STRATEGY TAGS SAVED
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