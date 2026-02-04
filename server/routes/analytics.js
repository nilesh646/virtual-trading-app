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

/**
 * ================================
 * STRATEGY PERFORMANCE
 * GET /api/analytics/strategies
 * ================================
 */
router.get("/strategies", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory.filter(t => t.type === "SELL");

    const stats = {};

    trades.forEach(trade => {
      const tags = trade.tags || ["untagged"];
      const pl = Number(trade.pl) || 0;

      tags.forEach(tag => {
        if (!stats[tag]) {
          stats[tag] = { trades: 0, wins: 0, totalPL: 0 };
        }

        stats[tag].trades++;
        stats[tag].totalPL += pl;
        if (pl > 0) stats[tag].wins++;
      });
    });

    const result = Object.entries(stats).map(([tag, data]) => ({
      tag,
      trades: data.trades,
      winRate: data.trades ? ((data.wins / data.trades) * 100).toFixed(1) : 0,
      totalPL: data.totalPL.toFixed(2)
    }));

    // Sort best strategy first
    result.sort((a, b) => b.totalPL - a.totalPL);

    res.json(result);

  } catch (err) {
    console.error("Strategy analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * =====================================
 * MONTHLY PERFORMANCE
 * GET /api/analytics/monthly
 * =====================================
 */
router.get("/monthly", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory.filter(t => t.type === "SELL");

    const monthlyStats = {};

    trades.forEach(trade => {
      const date = new Date(trade.date);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`; // e.g. 2026-1
      const pl = Number(trade.pl) || 0;

      if (!monthlyStats[key]) {
        monthlyStats[key] = { trades: 0, wins: 0, totalPL: 0 };
      }

      monthlyStats[key].trades++;
      monthlyStats[key].totalPL += pl;
      if (pl > 0) monthlyStats[key].wins++;
    });

    const result = Object.entries(monthlyStats).map(([month, data]) => ({
      month,
      trades: data.trades,
      winRate: data.trades
        ? ((data.wins / data.trades) * 100).toFixed(1)
        : 0,
      totalPL: data.totalPL.toFixed(2)
    }));

    // Sort newest month first
    result.sort((a, b) => new Date(b.month) - new Date(a.month));

    res.json(result);

  } catch (err) {
    console.error("Monthly analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * =====================================
 * BEST & WORST TRADE
 * GET /api/analytics/trade-extremes
 * =====================================
 */
router.get("/trade-extremes", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const sells = (user.tradeHistory || []).filter(t => t.type === "SELL");

    if (!sells.length) {
      return res.json({ best: null, worst: null });
    }

    let best = sells[0];
    let worst = sells[0];

    sells.forEach(trade => {
      const pl = Number(trade.pl || 0);

      if (pl > (best.pl || 0)) best = trade;
      if (pl < (worst.pl || 0)) worst = trade;
    });

    res.json({
      best: {
        symbol: best.symbol,
        pl: Number(best.pl).toFixed(2),
        date: best.date
      },
      worst: {
        symbol: worst.symbol,
        pl: Number(worst.pl).toFixed(2),
        date: worst.date
      }
    });

  } catch (err) {
    console.error("Trade extremes error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * =====================================
 * DAILY P/L ANALYTICS
 * GET /api/analytics/daily-pl
 * =====================================
 */
router.get("/daily-pl", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const sells = (user.tradeHistory || []).filter(t => t.type === "SELL");

    const dailyMap = {};

    sells.forEach(trade => {
      const dateKey = new Date(trade.date).toISOString().split("T")[0];
      const pl = Number(trade.pl || 0);

      if (!dailyMap[dateKey]) dailyMap[dateKey] = 0;
      dailyMap[dateKey] += pl;
    });

    const result = Object.keys(dailyMap)
      .sort()
      .map(date => ({
        date,
        pl: Number(dailyMap[date].toFixed(2))
      }));

    res.json(result);

  } catch (err) {
    console.error("Daily PL error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * =====================================
 * STREAK ANALYTICS
 * GET /api/analytics/streaks
 * =====================================
 */
// ===================== STREAK ANALYTICS =====================
router.get("/streaks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const sells = (user.tradeHistory || [])
      .filter(t => t.type === "SELL")
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let winStreak = 0;
    let lossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let currentStreak = 0;
    let currentType = null;

    sells.forEach(trade => {
      const pl = Number(trade.pl || 0);

      if (pl > 0) {
        winStreak++;
        lossStreak = 0;
        maxWinStreak = Math.max(maxWinStreak, winStreak);

        if (currentType === "win") currentStreak++;
        else {
          currentStreak = 1;
          currentType = "win";
        }

      } else if (pl < 0) {
        lossStreak++;
        winStreak = 0;
        maxLossStreak = Math.max(maxLossStreak, lossStreak);

        if (currentType === "loss") currentStreak++;
        else {
          currentStreak = 1;
          currentType = "loss";
        }

      } else {
        winStreak = 0;
        lossStreak = 0;
        currentStreak = 0;
        currentType = null;
      }
    });

    res.json({
      maxWinStreak,
      maxLossStreak,
      currentStreak,
      currentType
    });

  } catch (err) {
    console.error("Streak analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== MAX DRAWDOWN =====================
router.get("/drawdown", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    let equity = 100000; // starting capital
    let peak = equity;
    let maxDrawdown = 0;

    trades.forEach(trade => {
      const pl = Number(trade.pl || 0);
      equity += pl;

      if (equity > peak) peak = equity;

      const drawdown = (peak - equity) / peak;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    res.json({
      maxDrawdownPercent: (maxDrawdown * 100).toFixed(2)
    });

  } catch (err) {
    console.error("Drawdown error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== SHARPE RATIO =====================
router.get("/sharpe", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    // Only consider SELL trades (realized returns)
    const returns = trades
      .filter(t => t.type === "SELL")
      .map(t => Number(t.pl || 0));

    if (returns.length < 2) {
      return res.json({ sharpe: "0.00" });
    }

    const avg =
      returns.reduce((a, b) => a + b, 0) / returns.length;

    const variance =
      returns.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
      returns.length;

    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) {
      return res.json({ sharpe: "0.00" });
    }

    const sharpe = avg / stdDev;

    res.json({ sharpe: sharpe.toFixed(2) });

  } catch (err) {
    console.error("Sharpe error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== SORTINO RATIO =====================
router.get("/sortino", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    // Use realized P/L from SELL trades
    const returns = trades
      .filter(t => t.type === "SELL")
      .map(t => Number(t.pl || 0));

    if (returns.length < 2) {
      return res.json({ sortino: "0.00" });
    }

    const avg =
      returns.reduce((a, b) => a + b, 0) / returns.length;

    // Only negative returns for downside risk
    const downside = returns.filter(r => r < 0);

    if (downside.length === 0) {
      return res.json({ sortino: "0.00" });
    }

    const variance =
      downside.reduce((sum, r) => sum + Math.pow(r, 2), 0) /
      downside.length;

    const downsideDev = Math.sqrt(variance);

    if (downsideDev === 0) {
      return res.json({ sortino: "0.00" });
    }

    const sortino = avg / downsideDev;

    res.json({ sortino: sortino.toFixed(2) });

  } catch (err) {
    console.error("Sortino error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== PROFIT FACTOR =====================
router.get("/profit-factor", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    const sellTrades = trades.filter(t => t.type === "SELL");

    if (sellTrades.length === 0) {
      return res.json({ profitFactor: "0.00" });
    }

    let totalProfit = 0;
    let totalLoss = 0;

    sellTrades.forEach(t => {
      const pl = Number(t.pl || 0);
      if (pl > 0) totalProfit += pl;
      if (pl < 0) totalLoss += Math.abs(pl);
    });

    if (totalLoss === 0) {
      return res.json({ profitFactor: "∞" });
    }

    const pf = totalProfit / totalLoss;

    res.json({ profitFactor: pf.toFixed(2) });

  } catch (err) {
    console.error("Profit Factor error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== EXPECTANCY =====================
router.get("/expectancy", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = (user.tradeHistory || []).filter(t => t.type === "SELL");

    if (trades.length === 0) {
      return res.json({ expectancy: "0.00" });
    }

    let wins = [];
    let losses = [];

    trades.forEach(t => {
      const pl = Number(t.pl || 0);
      if (pl > 0) wins.push(pl);
      if (pl < 0) losses.push(Math.abs(pl));
    });

    const winRate = wins.length / trades.length;
    const lossRate = losses.length / trades.length;

    const avgWin = wins.length
      ? wins.reduce((a, b) => a + b, 0) / wins.length
      : 0;

    const avgLoss = losses.length
      ? losses.reduce((a, b) => a + b, 0) / losses.length
      : 0;

    const expectancy = winRate * avgWin - lossRate * avgLoss;

    res.json({ expectancy: expectancy.toFixed(2) });

  } catch (err) {
    console.error("Expectancy error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== RISK REWARD RATIO =====================
router.get("/risk-reward", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = (user.tradeHistory || []).filter(t => t.type === "SELL");

    if (trades.length === 0) {
      return res.json({ rrr: "0.00" });
    }

    let wins = [];
    let losses = [];

    trades.forEach(t => {
      const pl = Number(t.pl || 0);
      if (pl > 0) wins.push(pl);
      if (pl < 0) losses.push(Math.abs(pl));
    });

    const avgWin = wins.length
      ? wins.reduce((a, b) => a + b, 0) / wins.length
      : 0;

    const avgLoss = losses.length
      ? losses.reduce((a, b) => a + b, 0) / losses.length
      : 0;

    if (avgLoss === 0) {
      return res.json({ rrr: "∞" });
    }

    const rrr = avgWin / avgLoss;

    res.json({ rrr: rrr.toFixed(2) });

  } catch (err) {
    console.error("RRR error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ===================== TRADE DURATION =====================
router.get("/trade-duration", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const history = user.tradeHistory || [];

    // Pair BUY and SELL trades by symbol (FIFO style)
    const openTrades = {};
    let winDurations = [];
    let lossDurations = [];

    history.forEach(trade => {
      if (trade.type === "BUY") {
        if (!openTrades[trade.symbol]) openTrades[trade.symbol] = [];
        openTrades[trade.symbol].push(trade);
      }

      if (trade.type === "SELL" && openTrades[trade.symbol]?.length) {
        const buyTrade = openTrades[trade.symbol].shift();

        const buyTime = new Date(buyTrade.date).getTime();
        const sellTime = new Date(trade.date).getTime();

        const durationMinutes = (sellTime - buyTime) / (1000 * 60);

        if (trade.pl > 0) winDurations.push(durationMinutes);
        if (trade.pl < 0) lossDurations.push(durationMinutes);
      }
    });

    const avgWin =
      winDurations.length
        ? (winDurations.reduce((a, b) => a + b, 0) / winDurations.length)
        : 0;

    const avgLoss =
      lossDurations.length
        ? (lossDurations.reduce((a, b) => a + b, 0) / lossDurations.length)
        : 0;

    res.json({
      avgWinMinutes: avgWin.toFixed(1),
      avgLossMinutes: avgLoss.toFixed(1)
    });

  } catch (err) {
    console.error("Trade duration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== AI TRADE INSIGHTS =====================
router.get("/ai-insights", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory.filter(t => t.type === "SELL");

    if (!trades.length) {
      return res.json({ insights: ["Not enough trade data yet."] });
    }

    let wins = 0;
    let losses = 0;
    let totalWin = 0;
    let totalLoss = 0;

    trades.forEach(t => {
      if (t.pl > 0) {
        wins++;
        totalWin += t.pl;
      } else if (t.pl < 0) {
        losses++;
        totalLoss += Math.abs(t.pl);
      }
    });

    const winRate = (wins / trades.length) * 100;
    const avgWin = wins ? totalWin / wins : 0;
    const avgLoss = losses ? totalLoss / losses : 0;

    const insights = [];

    if (winRate < 40)
      insights.push("Your win rate is low. Consider improving trade selection.");

    if (avgWin < avgLoss)
      insights.push("Your losses are larger than your wins. Work on risk management.");

    if (avgWin > avgLoss * 2)
      insights.push("Great job letting winners run!");

    if (trades.length > 20)
      insights.push("You are trading frequently. Make sure quality > quantity.");

    if (!insights.length)
      insights.push("Your trading performance looks balanced. Keep refining!");

    res.json({ insights });

  } catch (err) {
    console.error("AI insights error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== AI MISTAKE DETECTOR =====================
router.get("/ai-mistakes", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory
      .filter(t => t.type === "SELL")
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (trades.length < 2) {
      return res.json({ mistakes: ["Not enough data to detect mistakes yet."] });
    }

    const mistakes = [];

    // ---------------- Revenge Trading ----------------
    for (let i = 1; i < trades.length; i++) {
      const prev = trades[i - 1];
      const curr = trades[i];

      const diffMinutes =
        (new Date(curr.date) - new Date(prev.date)) / (1000 * 60);

      if (prev.pl < 0 && diffMinutes < 10) {
        mistakes.push("You placed a trade shortly after a loss — possible revenge trading.");
        break;
      }
    }

    // ---------------- Overtrading ----------------
    const tradesByDay = {};
    trades.forEach(t => {
      const day = new Date(t.date).toDateString();
      tradesByDay[day] = (tradesByDay[day] || 0) + 1;
    });

    if (Object.values(tradesByDay).some(count => count > 10)) {
      mistakes.push("You are overtrading on some days. Quality > quantity.");
    }

    // ---------------- Risk/Reward Imbalance ----------------
    let wins = 0, losses = 0, totalWin = 0, totalLoss = 0;

    trades.forEach(t => {
      if (t.pl > 0) {
        wins++;
        totalWin += t.pl;
      } else if (t.pl < 0) {
        losses++;
        totalLoss += Math.abs(t.pl);
      }
    });

    const avgWin = wins ? totalWin / wins : 0;
    const avgLoss = losses ? totalLoss / losses : 0;

    if (avgWin < avgLoss) {
      mistakes.push("Your average loss is bigger than your average win.");
    }

    // ---------------- Big Single Loss ----------------
    const bigLoss = trades.find(t => Math.abs(t.pl) > user.balance * 0.05);
    if (bigLoss) {
      mistakes.push("You had a very large loss compared to your account size.");
    }

    if (!mistakes.length) {
      mistakes.push("No major trading mistakes detected recently. Keep it up!");
    }

    res.json({ mistakes });

  } catch (err) {
    console.error("AI mistake detection error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== AI TRADE SCORING =====================
router.get("/ai-trade-scores", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory.filter(t => t.type === "SELL");

    const scores = trades.map(trade => {
      let score = 50; // base neutral score

      const pl = Number(trade.pl || 0);
      const risk = Math.abs((trade.stopLoss || 0) - trade.price);
      const reward = Math.abs((trade.takeProfit || 0) - trade.price);

      // 🟢 Reward > Risk
      if (reward > risk) score += 15;

      // 🟢 Winning trade
      if (pl > 0) score += 15;

      // 🔴 Losing trade
      if (pl < 0) score -= 10;

      // 🟢 Followed plan
      if (trade.takeProfit && pl > 0) score += 10;
      if (trade.stopLoss && pl < 0) score += 5;

      // 🔴 Oversized loss
      if (Math.abs(pl) > user.balance * 0.05) score -= 15;

      // Clamp between 0–100
      score = Math.max(0, Math.min(100, score));

      return {
        symbol: trade.symbol,
        date: trade.date,
        pl,
        score
      };
    });

    res.json(scores);

  } catch (err) {
    console.error("AI trade scoring error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===================== AI WEEKLY REPORT =====================
router.get("/weekly-report", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const trades = (user.tradeHistory || []).filter(
      t => new Date(t.date) >= oneWeekAgo && t.type === "SELL"
    );

    const totalTrades = trades.length;
    const wins = trades.filter(t => Number(t.pl) > 0).length;
    const losses = trades.filter(t => Number(t.pl) < 0).length;
    const totalPL = trades.reduce((sum, t) => sum + Number(t.pl || 0), 0);

    const biggestWin = Math.max(0, ...trades.map(t => Number(t.pl || 0)));
    const biggestLoss = Math.min(0, ...trades.map(t => Number(t.pl || 0)));

    // 📉 Overtrading check
    const tradesPerDay = {};
    trades.forEach(t => {
      const d = new Date(t.date).toDateString();
      tradesPerDay[d] = (tradesPerDay[d] || 0) + 1;
    });

    const overtradeDays = Object.values(tradesPerDay).filter(c => c > 5).length;

    // 🧠 AI Feedback
    let feedback = "Steady trading week.";
    if (wins > losses && totalPL > 0) feedback = "Strong performance — keep your discipline.";
    if (losses > wins) feedback = "Focus on risk management and trade selection.";
    if (overtradeDays > 0) feedback += " You overtraded on some days — reduce frequency.";

    res.json({
      totalTrades,
      wins,
      losses,
      winRate: totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0,
      totalPL: totalPL.toFixed(2),
      biggestWin,
      biggestLoss,
      overtradeDays,
      feedback
    });

  } catch (err) {
    console.error("Weekly report error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ===================== STRATEGY PERFORMANCE =====================
router.get("/strategy-performance", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = (user.tradeHistory || []).filter(t => t.type === "SELL");

    const strategies = {};

    trades.forEach(trade => {
      const tags = trade.tags || ["untagged"];
      const pl = Number(trade.pl || 0);

      tags.forEach(tag => {
        if (!strategies[tag]) {
          strategies[tag] = { trades: 0, wins: 0, losses: 0, totalPL: 0 };
        }

        strategies[tag].trades += 1;
        strategies[tag].totalPL += pl;

        if (pl > 0) strategies[tag].wins += 1;
        if (pl < 0) strategies[tag].losses += 1;
      });
    });

    const result = Object.entries(strategies).map(([tag, data]) => ({
      strategy: tag,
      trades: data.trades,
      winRate: data.trades ? ((data.wins / data.trades) * 100).toFixed(1) : 0,
      totalPL: data.totalPL.toFixed(2),
      avgPL: data.trades ? (data.totalPL / data.trades).toFixed(2) : 0
    }));

    res.json(result);

  } catch (err) {
    console.error("Strategy analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// ===================== TRADE MISTAKE DETECTOR =====================
router.get("/mistakes", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = (user.tradeHistory || []).filter(t => t.type === "SELL");

    if (trades.length === 0) {
      return res.json({ message: "No trades yet" });
    }

    let totalWins = 0;
    let totalLosses = 0;
    let bigLosses = 0;
    let smallWins = 0;

    trades.forEach(t => {
      const pl = Number(t.pl || 0);

      if (pl > 0) {
        totalWins++;
        if (pl < 50) smallWins++; // small profit = exited too early
      }

      if (pl < 0) {
        totalLosses++;
        if (pl < -100) bigLosses++; // large loss = held too long
      }
    });

    const tradesPerDay = {};
    trades.forEach(t => {
      const day = new Date(t.date).toDateString();
      tradesPerDay[day] = (tradesPerDay[day] || 0) + 1;
    });

    const overtradeDays = Object.values(tradesPerDay).filter(v => v > 5).length;

    const mistakes = [];

    if (smallWins > totalWins * 0.5)
      mistakes.push("You often exit winning trades too early.");

    if (bigLosses > totalLosses * 0.4)
      mistakes.push("You let losing trades run too long.");

    if (overtradeDays > 3)
      mistakes.push("You are overtrading on several days.");

    if (totalWins < totalLosses)
      mistakes.push("Your win rate is below 50%. Improve trade selection.");

    if (mistakes.length === 0)
      mistakes.push("Great discipline! No major trading mistakes detected.");

    res.json({ mistakes });

  } catch (err) {
    console.error("Mistake detection error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
