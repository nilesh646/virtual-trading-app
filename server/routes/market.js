const express = require("express");
const router = express.Router();
const { getStockPrice } = require("../services/marketService");

const symbols = ["AAPL", "TSLA", "MSFT", "AMZN", "GOOGL"];

router.get("/", async (req, res) => {
  try {
    const prices = await Promise.all(
      symbols.map(symbol => getStockPrice(symbol))
    );

    const filtered = prices.filter(Boolean); // remove nulls

    res.json(filtered);
  } catch (err) {
    console.error("MARKET ROUTE ERROR:", err.message);
    res.status(500).json({ error: "Market fetch failed" });
  }
});

module.exports = router;
