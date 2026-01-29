const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory.filter(t => t.type === "SELL");

    let wins = 0;
    let losses = 0;
    let totalPL = 0;

    let bestTrade = -Infinity;
    let worstTrade = Infinity;

    let winStreak = 0;
    let lossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    let totalWinAmount = 0;
    let totalLossAmount = 0;

    trades.forEach(t => {
      const pl = Number(t.pl || 0);
      totalPL += pl;

      if (pl > 0) {
        wins++;
        totalWinAmount += pl;
        winStreak++;
        lossStreak = 0;
      } else if (pl < 0) {
        losses++;
        totalLossAmount += pl;
        lossStreak++;
        winStreak = 0;
      }

      if (winStreak > maxWinStreak) maxWinStreak = winStreak;
      if (lossStreak > maxLossStreak) maxLossStreak = lossStreak;

      if (pl > bestTrade) bestTrade = pl;
      if (pl < worstTrade) worstTrade = pl;
    });

    const totalTrades = trades.length;

    res.json({
      totalTrades,
      wins,
      losses,
      winRate: totalTrades ? ((wins / totalTrades) * 100).toFixed(2) : "0.00",
      totalPL: totalPL.toFixed(2),

      bestTrade: bestTrade === -Infinity ? 0 : bestTrade.toFixed(2),
      worstTrade: worstTrade === Infinity ? 0 : worstTrade.toFixed(2),

      maxWinStreak,
      maxLossStreak,

      avgWin: wins ? (totalWinAmount / wins).toFixed(2) : "0.00",
      avgLoss: losses ? (totalLossAmount / losses).toFixed(2) : "0.00"
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
