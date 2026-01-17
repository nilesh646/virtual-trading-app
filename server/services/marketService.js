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

const fluctuation = (Math.random() - 0.5) * 2; // -1 to +1
const stock = {
  symbol,
  price: parseFloat(quote["05. price"]) + fluctuation
};


module.exports = { getStockPrice };