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

router.get("/equity-curve", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let equity = 100000;
    const curve = [];

    user.tradeHistory.forEach((trade, i) => {
      const pl = Number(trade.pl || 0);
      equity += pl;

      curve.push({
        index: i + 1,
        equity: Number(equity.toFixed(2)),
        date: trade.date
      });
    });

    res.json(curve);
  } catch (err) {
    console.error("Equity curve error:", err);
    res.status(500).json({ error: "Equity curve error" });
  }
});


// ================================
// STRATEGY PERFORMANCE (TAGS)
// GET /api/analytics/strategies
// ================================
router.get("/strategies", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    const tagStats = {};

    trades.forEach(trade => {
      if (trade.type !== "SELL") return;
      if (!trade.tags || trade.tags.length === 0) return;

      const pl = Number(trade.pl || 0);

      trade.tags.forEach(tag => {
        if (!tagStats[tag]) {
          tagStats[tag] = {
            trades: 0,
            wins: 0,
            losses: 0,
            totalPL: 0
          };
        }

        tagStats[tag].trades += 1;
        tagStats[tag].totalPL += pl;

        if (pl >= 0) tagStats[tag].wins += 1;
        else tagStats[tag].losses += 1;
      });
    });

    const result = Object.entries(tagStats).map(([tag, data]) => ({
      tag,
      trades: data.trades,
      wins: data.wins,
      losses: data.losses,
      winRate: data.trades ? ((data.wins / data.trades) * 100).toFixed(2) : "0.00",
      totalPL: data.totalPL.toFixed(2)
    }));

    res.json(result);

  } catch (err) {
    console.error("Strategy analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================
// EQUITY CURVE PER STRATEGY (TAG)
// GET /api/analytics/strategy-curve
// ======================================
router.get("/strategy-curve", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    const curves = {};

    trades.forEach(trade => {
      if (trade.type !== "SELL") return;
      if (!trade.tags || trade.tags.length === 0) return;

      const pl = Number(trade.pl || 0);

      trade.tags.forEach(tag => {
        if (!curves[tag]) {
          curves[tag] = { equity: 100000, data: [] }; // start capital
        }

        curves[tag].equity += pl;

        curves[tag].data.push({
          date: trade.date,
          equity: Number(curves[tag].equity.toFixed(2))
        });
      });
    });

    res.json(curves);

  } catch (err) {
    console.error("Strategy curve error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/strategy-performance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const sells = user.tradeHistory.filter(t => t.type === "SELL" && t.tags?.length);

    const strategyMap = {};

    sells.forEach(trade => {
      trade.tags.forEach(tag => {
        if (!strategyMap[tag]) {
          strategyMap[tag] = { trades: 0, wins: 0, totalPL: 0 };
        }

        strategyMap[tag].trades += 1;
        strategyMap[tag].totalPL += trade.pl;
        if (trade.pl > 0) strategyMap[tag].wins += 1;
      });
    });

    const result = Object.entries(strategyMap).map(([tag, data]) => ({
      strategy: tag,
      trades: data.trades,
      winRate: data.trades ? (data.wins / data.trades) * 100 : 0,
      totalPL: data.totalPL
    }));

    res.json(result);

  } catch (err) {
    console.error("Strategy analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ================================
 * TRADER PERFORMANCE SCORE
 * GET /api/analytics/score
 * ================================
 */
router.get("/score", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory.filter(t => t.type === "SELL");

    if (trades.length === 0) {
      return res.json({ score: 0, grade: "No trades yet" });
    }

    let wins = 0;
    let losses = 0;
    let totalWin = 0;
    let totalLoss = 0;
    let disciplinedTrades = 0;

    trades.forEach(t => {
      const pl = Number(t.pl) || 0;

      if (pl > 0) {
        wins++;
        totalWin += pl;
      } else if (pl < 0) {
        losses++;
        totalLoss += Math.abs(pl);
      }

      if (t.stopLoss || t.takeProfit) disciplinedTrades++;
    });

    const winRate = (wins / trades.length) * 100;
    const profitFactor = totalLoss === 0 ? totalWin : totalWin / totalLoss;
    const disciplineRate = (disciplinedTrades / trades.length) * 100;

    // 🎯 SCORE CALCULATION (0–100)
    let score =
      winRate * 0.4 +
      Math.min(profitFactor * 10, 30) +
      disciplineRate * 0.3;

    score = Math.min(100, Math.round(score));

    let grade = "High Risk Trader";
    if (score >= 80) grade = "Elite Trader";
    else if (score >= 60) grade = "Consistent Trader";
    else if (score >= 40) grade = "Developing Trader";

    res.json({ score, grade });

  } catch (err) {
    console.error("Trader score error:", err);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
