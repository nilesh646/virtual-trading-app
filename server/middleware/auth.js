const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  let token = null;

  // 1️⃣ Try Authorization header (normal API calls)
  if (req.header("Authorization")) {
    token = req.header("Authorization").replace("Bearer ", "");
  }

  // 2️⃣ Try query param (for CSV download)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    res.status(401).json({ error: "Token is not valid" });
  }
};
