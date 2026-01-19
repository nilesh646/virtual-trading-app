const express = require("express");
const router = express.Router();
const { getStockPrice } = require("../services/marketService");

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


module.exports = router;
