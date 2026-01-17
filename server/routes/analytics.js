const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let totalInvested = 0;
    let totalSold = 0;
    let buyCount = 0;
    let sellCount = 0;

    user.tradeHistory.forEach(t => {
      if (t.type === "BUY") {
        totalInvested += t.price * t.quantity;
        buyCount++;
      }
      if (t.type === "SELL") {
        totalSold += t.price * t.quantity;
        sellCount++;
      }
    });

    const netPL = totalSold - totalInvested;

    res.json({
      totalInvested,
      totalSold,
      netPL,
      buyCount,
      sellCount
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
