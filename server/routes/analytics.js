const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory.filter(t => t.type === "SELL");

    let equity = 100000;
    let peak = equity;
    let maxDrawdown = 0;

    let wins = 0;
    let losses = 0;
    let totalPL = 0;

    const returns = [];

    trades.forEach(t => {
      const pl = Number(t.pl || 0);
      const ret = pl / equity; // % return relative to equity
      returns.push(ret);

      equity += pl;
      totalPL += pl;

      if (pl > 0) wins++;
      else if (pl < 0) losses++;

      if (equity > peak) peak = equity;

      const drawdown = (peak - equity) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const currentDrawdown = ((peak - equity) / peak) * 100;

    // ===== VOLATILITY =====
    const avgReturn =
      returns.length > 0
        ? returns.reduce((a, b) => a + b, 0) / returns.length
        : 0;

    const variance =
      returns.length > 0
        ? returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) /
          returns.length
        : 0;

    const volatility = Math.sqrt(variance) * 100; // %

    // ===== SHARPE RATIO =====
    const sharpe =
      volatility !== 0 ? ((avgReturn * 100) / volatility).toFixed(2) : "0.00";

    // ===== RISK LEVEL =====
    let riskLevel = "LOW";
    if (maxDrawdown > 0.3) riskLevel = "HIGH";
    else if (maxDrawdown > 0.15) riskLevel = "MEDIUM";

    // ===== STRATEGY QUALITY =====
    let strategyQuality = "POOR";
    if (sharpe > 1.5) strategyQuality = "PRO";
    else if (sharpe > 0.7) strategyQuality = "GOOD";

    res.json({
      totalTrades: trades.length,
      wins,
      losses,
      winRate: trades.length ? ((wins / trades.length) * 100).toFixed(2) : "0.00",
      totalPL: totalPL.toFixed(2),

      maxDrawdown: (maxDrawdown * 100).toFixed(2),
      currentDrawdown: currentDrawdown.toFixed(2),
      equityPeak: peak.toFixed(2),
      riskLevel,

      volatility: volatility.toFixed(2),
      sharpeRatio: sharpe,
      strategyQuality
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
