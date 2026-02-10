const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { getStockPrice } = require("../services/marketService");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const alerts = [];

    // check holdings for SL alerts
    for (const holding of user.holdings) {
      const stock = await getStockPrice(holding.symbol);
      if (!stock) continue;

      const price = stock.price;

      // STOP LOSS WARNING
      if (
        holding.stopLoss &&
        price <= holding.stopLoss * 1.02
      ) {
        alerts.push({
          type: "stoploss",
          symbol: holding.symbol,
          message: `⚠ ${holding.symbol} near Stop Loss`,
          price
        });
      }

      // BREAKOUT
      if (stock.changePercent > 2) {
        alerts.push({
          type: "breakout",
          symbol: holding.symbol,
          message: `🔥 ${holding.symbol} breakout ${stock.changePercent.toFixed(2)}%`,
          price
        });
      }

      // MOMENTUM
      if (stock.changePercent > 1) {
        alerts.push({
          type: "momentum",
          symbol: holding.symbol,
          message: `🚀 ${holding.symbol} strong momentum`,
          price
        });
      }
    }

    res.json(alerts);
  } catch (err) {
    console.error("Alerts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
