const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    console.log("🔑 AUTH HEADER:", req.headers.authorization);
    console.log("🔑 JWT_SECRET USED:", process.env.JWT_SECRET);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    console.log("🔑 RAW TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔓 DECODED TOKEN:", decoded);

    req.user = decoded.id;
    next();
  } catch (err) {
    console.error("❌ JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ error: "Token is not valid" });
  }
};

module.exports = authMiddleware;

