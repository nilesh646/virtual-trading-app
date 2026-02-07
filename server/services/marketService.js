const axios = require("axios");

const API_KEY = process.env.FINNHUB_API_KEY;

const cache = {};
const CACHE_DURATION = 5000; // 5 sec cache

// ---------- GLOBAL MARKET TREND ----------
let marketTrend = 0;

// Market direction changes every 30 sec
setInterval(() => {
  marketTrend = (Math.random() - 0.5) * 0.01;
  console.log("📈 Market trend updated:", marketTrend.toFixed(4));
}, 30000);

// Store last prices for smooth movement
const lastPrices = {};

const getStockPrice = async (symbol) => {
  const now = Date.now();

  // ✅ return cached price if valid
  if (cache[symbol] && now - cache[symbol].time < CACHE_DURATION) {
    return cache[symbol].data;
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const res = await axios.get(url);

    const basePrice = res.data.c;

    if (!basePrice || basePrice === 0) {
      return cache[symbol]?.data || null;
    }

    // initialize previous price
    if (!lastPrices[symbol]) {
      lastPrices[symbol] = basePrice;
    }

    // ---------- REALISTIC MOVEMENT ----------
    const randomNoise = (Math.random() - 0.5) * 0.01;
    const movement = marketTrend + randomNoise;

    const newPrice = lastPrices[symbol] * (1 + movement);
    const simulatedPrice = Number(newPrice.toFixed(2));

    // calculate change %
    const changePercent =
      ((simulatedPrice - lastPrices[symbol]) / lastPrices[symbol]) * 100;

    lastPrices[symbol] = simulatedPrice;

    const stock = {
      symbol,
      price: simulatedPrice,
      changePercent
    };

    cache[symbol] = {
      data: stock,
      time: now
    };

    return stock;

  } catch (err) {
    console.error("Market API error:", err.message);
    return cache[symbol]?.data || null;
  }
};

module.exports = { getStockPrice };
