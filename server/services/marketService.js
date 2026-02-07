const axios = require("axios");
const API_KEY = process.env.FINNHUB_API_KEY;

const cache = {};
const CACHE_DURATION = 5000; // 5 seconds

// 🔥 GLOBAL MARKET TREND (affects all stocks together)
let marketTrend = 0;

// Market direction changes every 30 seconds
setInterval(() => {
  marketTrend = (Math.random() - 0.5) * 0.01; // -0.5% to +0.5%
  console.log("📈 Market trend updated:", marketTrend.toFixed(4));
}, 30000);

// Store last simulated prices so movement continues smoothly
const lastPrices = {};

const getStockPrice = async (symbol) => {
  const now = Date.now();
  const changePercent =
    ((livePrice - basePrice) / basePrice) * 100;

  const stock = {
    symbol,
    price: livePrice,
    changePercent
  };

  // Return cached price if still valid
  if (cache[symbol] && now - cache[symbol].time < CACHE_DURATION) {
    return cache[symbol].data;
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const res = await axios.get(url);

    let basePrice = res.data.c;
    if (!basePrice || basePrice === 0) return cache[symbol]?.data || null;

    // Initialize last price if not present
    if (!lastPrices[symbol]) {
      lastPrices[symbol] = basePrice;
    }

    // 🔥 REALISTIC MOVEMENT
    const randomNoise = (Math.random() - 0.5) * 0.01; // individual stock movement ±1%
    const changePercent = marketTrend + randomNoise;

    const newPrice = lastPrices[symbol] * (1 + changePercent);
    const simulatedPrice = Number(newPrice.toFixed(2));

    lastPrices[symbol] = simulatedPrice;

    const stock = { symbol, price: simulatedPrice };

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
