const axios = require("axios");

const API_KEY = process.env.FINNHUB_API_KEY;

const getStockPrice = async (symbol) => {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const res = await axios.get(url);

    if (!res.data || typeof res.data.c !== "number") {
      return null;
    }

    // 🔥 Simulated fluctuation for demo realism
    const fluctuation = (Math.random() - 0.5) * 2; // -1 to +1

    return {
      symbol,
      price: Number((res.data.c + fluctuation).toFixed(2))
    };
  } catch (err) {
    console.error("Finnhub error:", err.message);
    return null;
  }
};

module.exports = { getStockPrice };
