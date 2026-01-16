const axios = require("axios");

const API_KEY = process.env.FINNHUB_API_KEY;

const getStockPrice = async (symbol) => {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`;
    const res = await axios.get(url);

    // Finnhub returns current price as "c"
    if (!res.data || !res.data.c) return null;

    return {
      symbol,
      price: res.data.c
    };
  } catch (err) {
    console.error("Finnhub error:", err.message);
    return null;
  }
};

module.exports = { getStockPrice };