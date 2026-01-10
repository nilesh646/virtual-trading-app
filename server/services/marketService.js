const axios = require("axios");

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// In-memory cache
let cache = {};
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute

const getStockPrice = async (symbol) => {
  const now = Date.now();

  // Return cached value if still valid
  if (cache[symbol] && now - lastFetchTime < CACHE_DURATION) {
    return cache[symbol];
  }

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);

    const quote = response.data["Global Quote"];
    if (!quote) return null;

    const stock = {
      symbol,
      price: parseFloat(quote["05. price"])
    };

    // Save to cache
    cache[symbol] = stock;
    lastFetchTime = now;

    return stock;
  } catch (error) {
    console.error("Market API error:", error.message);

    // Fallback to cache if API fails
    return cache[symbol] || null;
  }
};

module.exports = { getStockPrice };

