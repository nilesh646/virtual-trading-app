const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find();

    const leaderboard = users.map(u => {
      const totalPL = (u.tradeHistory || []).reduce(
        (sum, t) => sum + (t.pl || 0),
        0
      );

      return {
        name: u.name,
        totalPL: Number(totalPL.toFixed(2))
      };
    })
    .sort((a, b) => b.totalPL - a.totalPL)
    .slice(0, 5);

    res.json(leaderboard);
  } catch (err) {
    console.error("Leaders error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
