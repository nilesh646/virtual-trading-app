const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const { tag } = req.query;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let trades = user.tradeHistory || [];

    // 🔥 FILTER BY TAG
    if (tag && tag !== "all") {
      trades = trades.filter(trade =>
        trade.tags && trade.tags.includes(tag)
      );
    }

    res.json(trades);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
