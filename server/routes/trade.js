const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const marketData = require("../data/marketData");


// BUY stock
router.post("/buy", auth, async (req, res) => {
  const { symbol, quantity } = req.body;

  const stock = marketData.find(s => s.symbol === symbol);
  if (!stock) return res.status(404).json({ error: "Stock not found" });

  const user = await User.findById(req.user);

  const cost = stock.price * quantity;
  if (user.balance < cost)
    return res.status(400).json({ error: "Insufficient balance" });

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
  res.json({ message: "Stock bought", balance: user.balance });
});


// SELL stock
router.post("/sell", auth, async (req, res) => {
  const { symbol, quantity } = req.body;

  const user = await User.findById(req.user);
  const holding = user.holdings.find(h => h.symbol === symbol);

  if (!holding || holding.quantity < quantity)
    return res.status(400).json({ error: "Not enough stock" });

  const stock = marketData.find(s => s.symbol === symbol);
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
  res.json({ message: "Stock sold", balance: user.balance });
});


module.exports = router;