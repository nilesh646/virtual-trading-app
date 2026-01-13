const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// Get logged-in user's wallet
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      balance: user.balance,
      holdings: user.holdings
    });
  } catch (err) {
    console.error("Wallet route error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
