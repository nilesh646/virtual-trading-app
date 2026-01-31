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

// 📥 EXPORT TRADE HISTORY AS CSV
router.get("/export", auth, async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).send("No token");

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const trades = user.tradeHistory || [];

    // CSV Header
    let csv = "Date,Type,Symbol,Quantity,Price,P/L,Tags,Notes\n";

    trades.forEach(trade => {
      const row = [
        new Date(trade.date).toLocaleString(),
        trade.type,
        trade.symbol,
        trade.quantity,
        trade.price,
        trade.pl || 0,
        trade.tags?.join("|") || "",
        trade.notes || ""
      ]
        .map(val => `"${val}"`)
        .join(",");

      csv += row + "\n";
    });

    res.header("Content-Type", "text/csv");
    res.attachment("trade_history.csv");
    res.send(csv);

  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ error: "Export failed" });
  }
});


module.exports = router;
