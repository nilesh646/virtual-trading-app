const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { getStockPrice } = require("../services/marketService");


// BUY
router.post("/buy", auth, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔥 FETCH STOCK FIRST
    const stock = await getStockPrice(symbol);
    if (!stock) {
      return res.status(400).json({ error: "Stock price unavailable" });
    }

    const price = stock.price;
    const cost = price * quantity;

    if (user.balance < cost) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // 🔥 UPDATE WALLET
    user.balance -= cost;

    const holding = user.holdings.find(h => h.symbol === symbol);

    if (holding) {
      holding.avgPrice =
        (holding.avgPrice * holding.quantity + price * quantity) /
        (holding.quantity + quantity);
      holding.quantity += quantity;
    } else {
      user.holdings.push({
        symbol,
        quantity,
        avgPrice: price
      });
    }

    // 🔥 SAVE HISTORY
    user.tradeHistory.push({
      type: "BUY",
      symbol,
      quantity,
      price
    });

    await user.save();

    res.json({ message: "Stock bought successfully" });
  } catch (err) {
    console.error("BUY ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});




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

    // 🔥 Fetch live price
    const stock = await getStockPrice(symbol);
    if (!stock) return res.status(500).json({ error: "Price unavailable" });

    const sellPrice = stock.price;

    // 🔥 REALIZED P/L
    const realizedPL = (sellPrice - holding.avgPrice) * quantity;

    // Update balance
    user.balance += sellPrice * quantity;

    // Update holding
    holding.quantity -= quantity;
    if (holding.quantity === 0) {
      user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    }

    // 🔥 Store trade with pnl
    user.tradeHistory.push({
      type: "SELL",
      symbol,
      quantity,
      price: sellPrice,
      pnl: realizedPL
    });

    await user.save();

    res.json({ message: "Stock sold", realizedPL });
  } catch (err) {
    console.error("Sell error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;