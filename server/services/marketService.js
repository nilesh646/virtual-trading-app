const axios = require("axios");
const API_KEY = process.env.FINNHUB_API_KEY;

const cache = {}; // { symbol: { price, time } }
const CACHE_DURATION = 5000; // 5 seconds

const getStockPrice = async (symbol) => {
  const now = Date.now();

  // Return cached if still fresh
  if (cache[symbol] && now - cache[symbol].time < CACHE_DURATION) {
    return cache[symbol].data;
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const res = await axios.get(url);

    const price = res.data.c;
    if (!price) return null;

    const stock = { symbol, price };

    cache[symbol] = {
      data: stock,
      time: now,
    };

    return stock;
  } catch (err) {
    console.error("Market API error:", err.message);
    return cache[symbol]?.data || null;
  }
};

module.exports = { getStockPrice };
