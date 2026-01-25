const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

/* ================================
   Helper Functions
================================ */

const calculateMaxDrawdown = (equity) => {
  let peak = equity[0] || 0;
  let maxDrawdown = 0;

  equity.forEach(value => {
    if (value > peak) peak = value;
    const drawdown = peak ? (peak - value) / peak : 0;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  return (maxDrawdown * 100).toFixed(2);
};

const calculateSharpe = (returns) => {
  if (!returns.length) return "0.00";

  const avg =
    returns.reduce((a, b) => a + b, 0) / returns.length;

  const variance =
    returns.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
    returns.length;

  const stdDev = Math.sqrt(variance);
  if (!stdDev) return "0.00";

  return (avg / stdDev).toFixed(2);
};

/* ================================
   BASIC ANALYTICS
   GET /api/analytics
================================ */

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    let wins = 0;
    let losses = 0;
    let totalPL = 0;
    let equity = 100000;

    const equityCurve = [];
    const returns = [];

    trades.forEach(t => {
      const pl = Number(t.pl) || 0;

      totalPL += pl;
      equity += pl;

      equityCurve.push(equity);
      returns.push(pl);

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
      totalPL: totalPL.toFixed(2),
      maxDrawdown: calculateMaxDrawdown(equityCurve),
      sharpeRatio: calculateSharpe(returns)
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================================
   EQUITY CURVE
   GET /api/analytics/equity-curve
================================ */

router.get("/equity-curve", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];
    let equity = 100000;

    const curve = trades.map((trade, index) => {
      equity += Number(trade.pl) || 0;
      return {
        index: index + 1,
        equity: Number(equity.toFixed(2)),
        date: trade.createdAt
      };
    });

    res.json(curve);
  } catch (err) {
    console.error("Equity curve error:", err);
    res.status(500).json({ error: "Equity curve error" });
  }
});

router.get("/leaders", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const sells = user.tradeHistory.filter(t => t.type === "SELL");

    const sorted = [...sells].sort((a, b) => b.pl - a.pl);

    res.json({
      best: sorted[0] || null,
      worst: sorted[sorted.length - 1] || null
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;


