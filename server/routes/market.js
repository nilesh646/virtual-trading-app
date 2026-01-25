const express = require("express");
const router = express.Router();
const axios = require("axios");   // ✅ CommonJS

// Example market route
router.get("/", async (req, res) => {
  try {
    const stocks = ["AAPL", "TSLA", "MSFT"];

    const results = await Promise.all(
      stocks.map(async (symbol) => {
        const response = await axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
        );

        return {
          symbol,
          price: response.data.c
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("Market route error:", err.message);
    res.status(500).json({ error: "Market data failed" });
  }
});

module.exports = router;   // ✅ CommonJS export
