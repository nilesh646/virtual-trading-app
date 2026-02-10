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
    const updatedWatchlist = new Set(user.watchlist || []);

    for (const holding of user.holdings) {
      const stock = await getStockPrice(holding.symbol);
      if (!stock) continue;

      const price = stock.price;
      const change = Number(stock.changePercent || 0);

      // ================= HIGH PRIORITY =================
      if (change > 2) {
        alerts.push({
          type: "breakout",
          priority: "HIGH",
          symbol: holding.symbol,
          message: `🔥 ${holding.symbol} breakout ${change.toFixed(2)}%`,
          price
        });

        // auto add to watchlist
        updatedWatchlist.add(holding.symbol);
      }

      // ================= MEDIUM PRIORITY =================
      else if (change > 1) {
        alerts.push({
          type: "momentum",
          priority: "MEDIUM",
          symbol: holding.symbol,
          message: `🚀 ${holding.symbol} strong momentum`,
          price
        });
      }

      // ================= LOW PRIORITY =================
      if (
        holding.stopLoss &&
        price <= holding.stopLoss * 1.02
      ) {
        alerts.push({
          type: "stoploss",
          priority: "LOW",
          symbol: holding.symbol,
          message: `⚠ ${holding.symbol} near Stop Loss`,
          price
        });
      }
    }

    // Save updated watchlist automatically
    user.watchlist = Array.from(updatedWatchlist);
    await user.save();

    // Sort by priority
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

    alerts.sort(
      (a, b) =>
        priorityOrder[b.priority] - priorityOrder[a.priority]
    );

    res.json(alerts);
  } catch (err) {
    console.error("Alerts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
