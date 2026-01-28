const axios = require("axios");
const API_KEY = process.env.FINNHUB_API_KEY;

const cache = {};
const CACHE_DURATION = 5000; // 5 seconds

const getStockPrice = async (symbol) => {
  const now = Date.now();

  if (cache[symbol] && now - cache[symbol].time < CACHE_DURATION) {
    return cache[symbol].data;
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const res = await axios.get(url);

    let basePrice = res.data.c;

    if (!basePrice || basePrice === 0) return cache[symbol]?.data || null;

    // 🔥 ADD LIVE MOVEMENT
    const fluctuation = (Math.random() - 0.5) * (basePrice * 0.01); // ±1%
    const livePrice = parseFloat((basePrice + fluctuation).toFixed(2));

    const stock = { symbol, price: livePrice };

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
