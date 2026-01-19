const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];
    const sellTrades = trades.filter(t => t.type === "SELL");

    const wins = sellTrades.filter(t => t.pnl > 0).length;
    const losses = sellTrades.filter(t => t.pnl < 0).length;

    res.json({
      totalTrades: sellTrades.length,
      wins,
      losses,
      winRate: sellTrades.length
        ? ((wins / sellTrades.length) * 100).toFixed(2)
        : 0,
      totalPL: sellTrades.reduce((s, t) => s + (t.pnl || 0), 0)
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics error" });
  }
});

module.exports = router;
