const axios = require("axios");

const API_KEY = process.env.FINNHUB_API_KEY;

// store last price to make smooth movement
const lastPrices = {};

const getStockPrice = async (symbol) => {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const res = await axios.get(url);

    if (!res.data || !res.data.c) return null;

    let basePrice = Number(res.data.c);

    // 🔥 If we already have a price, fluctuate from that instead
    if (lastPrices[symbol]) {
      basePrice = lastPrices[symbol];
    }

    // Add small live fluctuation ±0.5%
    const changePercent = (Math.random() - 0.5) * 0.01;
    const newPrice = basePrice * (1 + changePercent);

    lastPrices[symbol] = Number(newPrice.toFixed(2));

    return {
      symbol,
      price: lastPrices[symbol]
    };

  } catch (err) {
    console.error("Market API error:", err.message);
    return null;
  }
};

module.exports = { getStockPrice };

