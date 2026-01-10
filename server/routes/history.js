const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// Get user's trade history
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.json(user.tradeHistory);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
