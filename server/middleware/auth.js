const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ THIS IS CRITICAL
    req.userId = decoded.id;

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
