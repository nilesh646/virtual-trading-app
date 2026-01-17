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

    res.json(user.tradeHistory);
  } catch (err) {
    console.error("HISTORY ERROR:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
