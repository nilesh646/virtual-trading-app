const express = require("express");
const router = express.Router();
const { getStockPrice } = require("../services/marketService");
const User = require("../models/User");


const symbols = ["AAPL", "GOOGL", "TSLA", "AMZN"];

router.get("/", async (req, res) => {
  const results = [];

  for (const symbol of symbols) {
    const stock = await getStockPrice(symbol);
    if (stock) results.push(stock);
  }

  res.json(results);
});

const handleBuy = async (symbol) => {
  try {
    await onBuy(symbol);
  } catch (err) {
    alert("Buy failed");
  }
};

const users = await User.find({ "holdings.symbol": symbol });

for (const user of users) {
  const holding = user.holdings.find(h => h.symbol === symbol);
  if (!holding) continue;

  const price = stock.price;

  // STOP LOSS
  if (holding.stopLoss && price <= holding.stopLoss) {
    const pl = (price - holding.avgPrice) * holding.quantity;

    user.balance += price * holding.quantity;

    user.tradeHistory.push({
      type: "AUTO-SELL (SL)",
      symbol,
      quantity: holding.quantity,
      price,
      pl,
      date: new Date()
    });

    user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    await user.save();
    continue;
  }

  // TAKE PROFIT
  if (holding.takeProfit && price >= holding.takeProfit) {
    const pl = (price - holding.avgPrice) * holding.quantity;

    user.balance += price * holding.quantity;

    user.tradeHistory.push({
      type: "AUTO-SELL (TP)",
      symbol,
      quantity: holding.quantity,
      price,
      pl,
      date: new Date()
    });

    user.holdings = user.holdings.filter(h => h.symbol !== symbol);
    await user.save();
  }
}



module.exports = router;
