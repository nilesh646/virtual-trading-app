const axios = require("axios");
console.log(
  "🔑 Alpha key loaded:",
  process.env.ALPHA_VANTAGE_API_KEY ? "YES" : "NO"
);

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Cache per symbol
const cache = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

const getStockPrice = async (symbol) => {
  const now = Date.now();

  // ✅ Return cached value if valid
  if (
    cache[symbol] &&
    now - cache[symbol].timestamp < CACHE_DURATION
  ) {
    return cache[symbol].data;
  }

  try {
    console.log("📈 Fetching price for:", symbol);

    const url = "https://www.alphavantage.co/query";
    const response = await axios.get(url, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol,
        apikey: API_KEY
      }
    });
    console.log("📦 Alpha raw response:", response.data);

    // 🔴 Log full response for debugging
    if (response.data.Note || response.data.Information) {
      console.error("⚠️ Alpha Vantage limit:", response.data);
      return cache[symbol]?.data || null;
    }

    const quote = response.data["Global Quote"];
    if (!quote || !quote["05. price"]) {
      console.error("❌ Invalid quote:", response.data);
      return cache[symbol]?.data || null;
    }

    const stock = {
      symbol,
      price: parseFloat(quote["05. price"])
    };

    // ✅ Save to cache
    cache[symbol] = {
      data: stock,
      timestamp: now
    };

    return stock;
  } catch (error) {
    console.error(
      "❌ Market API error:",
      error.response?.data || error.message
    );

    return cache[symbol]?.data || null;
  }
};

module.exports = { getStockPrice };
