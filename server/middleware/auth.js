const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("RAW TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DECODED TOKEN:", decoded);

    req.userId = decoded.id;
    console.log("USER ID SET TO:", req.userId);

    next();
  } catch (err) {
    console.error("JWT ERROR:", err.message);
    return res.status(401).json({ error: "Token is not valid" });
  }
};

