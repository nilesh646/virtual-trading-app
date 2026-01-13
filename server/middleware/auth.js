const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Expect: "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token format invalid" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user || decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;
