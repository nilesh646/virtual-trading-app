const axios = require("axios");

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Per-symbol cache
const cache = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

const getStockPrice = async (symbol) => {
  const now = Date.now();

  // Return cached value if valid
  if (
    cache[symbol] &&
    now - cache[symbol].timestamp < CACHE_DURATION
  ) {
    return cache[symbol].data;
  }

  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const response = await axios.get(url);

    const quote = response.data["Global Quote"];
    if (!quote || !quote["05. price"]) return null;

    const stock = {
      symbol,
      price: parseFloat(quote["05. price"]),
    };

    cache[symbol] = {
      data: stock,
      timestamp: now,
    };

    return stock;
  } catch (error) {
    console.error("Market API error:", error.message);
    return cache[symbol]?.data || null;
  }
};

module.exports = { getStockPrice };