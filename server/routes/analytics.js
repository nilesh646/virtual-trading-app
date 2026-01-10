const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const { getStockPrice } = require("../services/marketService");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);

    let totalValue = user.balance;
    let totalInvested = 0;
    const breakdown = [];

    for (const h of user.holdings) {
      const live = await getStockPrice(h.symbol);
      if (!live) continue;

      const invested = h.quantity * h.avgPrice;
      const current = h.quantity * live.price;
      const pnl = current - invested;

      totalInvested += invested;
      totalValue += current;

      breakdown.push({
        symbol: h.symbol,
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        currentPrice: live.price,
        invested,
        current,
        pnl
      });
    }

    res.json({
      balance: user.balance,
      totalInvested,
      totalValue,
      totalPnL: totalValue - user.balance - totalInvested,
      breakdown
    });
  } catch (err) {
    res.status(500).json({ error: "Analytics failed" });
  }
});

module.exports = router;
