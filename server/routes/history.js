const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  const user = await User.findById(req.user);

  const total = user.tradeHistory.length;
  const start = total - page * limit;
  const end = start + limit;

  const trades = user.tradeHistory
    .slice(Math.max(0, start), end)
    .reverse();

  res.json({
    trades,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
});

module.exports = router;
