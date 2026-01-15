const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Must be: "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token format invalid" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX: decoded.id, NOT decoded.user
    req.user = decoded.id;

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: "Token is not valid" });
  }
};

