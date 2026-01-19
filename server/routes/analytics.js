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

    const totalTrades = sellTrades.length;
    const wins = sellTrades.filter(t => t.pnl > 0).length;
    const losses = sellTrades.filter(t => t.pnl < 0).length;

    const totalPL = sellTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

    res.json({
      totalTrades,
      wins,
      losses,
      winRate: totalTrades ? ((wins / totalTrades) * 100).toFixed(2) : 0,
      totalPL: totalPL.toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics error" });
  }
});

module.exports = router;
