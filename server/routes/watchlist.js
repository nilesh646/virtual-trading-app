const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// GET watchlist
router.get("/", auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user.watchlist || []);
});

// ADD / REMOVE watchlist
router.post("/toggle", auth, async (req, res) => {
  const { symbol } = req.body;

  const user = await User.findById(req.userId);

  if (user.watchlist.includes(symbol)) {
    user.watchlist = user.watchlist.filter(s => s !== symbol);
  } else {
    user.watchlist.push(symbol);
  }

  await user.save();

  res.json(user.watchlist);
});

module.exports = router;