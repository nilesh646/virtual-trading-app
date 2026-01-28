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

    const trades = user.tradeHistory.filter(t => t.type === "SELL");

    let wins = 0;
    let losses = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    let totalPL = 0;

    trades.forEach(t => {
      const pl = Number(t.pl) || 0;
      totalPL += pl;

      if (pl > 0) {
        wins++;
        totalWinAmount += pl;
      } else if (pl < 0) {
        losses++;
        totalLossAmount += Math.abs(pl);
      }
    });

    const totalTrades = trades.length;
    const winRate = totalTrades ? (wins / totalTrades) * 100 : 0;

    const avgWin = wins ? totalWinAmount / wins : 0;
    const avgLoss = losses ? totalLossAmount / losses : 0;

    const riskReward = avgLoss ? avgWin / avgLoss : 0;
    const profitFactor = totalLossAmount ? totalWinAmount / totalLossAmount : 0;

    const expectancy = totalTrades
      ? ((winRate / 100) * avgWin) - ((1 - winRate / 100) * avgLoss)
      : 0;

    res.json({
      totalTrades,
      wins,
      losses,
      winRate: winRate.toFixed(2),
      totalPL: totalPL.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      riskReward: riskReward.toFixed(2),
      profitFactor: profitFactor.toFixed(2),
      expectancy: expectancy.toFixed(2)
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


