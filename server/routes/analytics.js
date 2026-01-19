const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

/**
 * ================================
 * BASIC ANALYTICS
 * GET /api/analytics
 * ================================
 */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    let wins = 0;
    let losses = 0;
    let totalPL = 0;

    trades.forEach(t => {
      const pl = Number(t.pl) || 0;
      totalPL += pl;

      if (pl > 0) wins++;
      else if (pl < 0) losses++;
    });

    res.json({
      totalTrades: trades.length,
      wins,
      losses,
      winRate: trades.length
        ? ((wins / trades.length) * 100).toFixed(2)
        : "0.00",
      totalPL: totalPL.toFixed(2)
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ================================
 * EQUITY CURVE
 * GET /api/analytics/equity-curve
 * ================================
 */
router.get("/equity-curve", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    let equity = 100000; // initial virtual capital
    const curve = [];

    trades.forEach((trade, index) => {
      const pl = Number(trade.pl) || 0;
      equity += pl;

      curve.push({
        index: index + 1,
        equity: Number(equity.toFixed(2)),
        date: trade.createdAt
      });
    });

    res.json(curve);
  } catch (err) {
    console.error("Equity curve error:", err);
    res.status(500).json({ error: "Equity curve error" });
  }
});

module.exports = router;

