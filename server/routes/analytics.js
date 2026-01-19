const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const trades = user.tradeHistory || [];

    let wins = 0;
    let losses = 0;
    let totalPL = 0;

    trades.forEach(t => {
      totalPL += t.pl;
      if (t.pl >= 0) wins++;
      else losses++;
    });

    res.json({
      totalTrades: trades.length,
      wins,
      losses,
      winRate: trades.length ? ((wins / trades.length) * 100).toFixed(2) : 0,
      totalPL: totalPL.toFixed(2)
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
