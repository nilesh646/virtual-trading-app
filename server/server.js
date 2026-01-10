require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect DB
connectDB();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// API routes
const exampleRoute = require("./routes/example");
const marketRoute = require("./routes/market");
const tradeRoute = require("./routes/trade");
const authRoute = require("./routes/auth");
const walletRoute = require("./routes/wallet");
const historyRoute = require("./routes/history");
const analyticsRoute = require("./routes/analytics");

app.use("/api", exampleRoute);
app.use("/api/market", marketRoute);
app.use("/api/trade", tradeRoute);
app.use("/api/auth", authRoute);
app.use("/api/wallet", walletRoute);
app.use("/api/history", historyRoute);
app.use("/api/analytics", analyticsRoute);

// ✅ FIXED PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
