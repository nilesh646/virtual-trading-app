import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Sparkline from "./Sparkline";

const Portfolio = ({
  holdings = [],
  prices = {},
  priceHistory = {},
  refreshWallet,
}) => {
  const [noteInputs, setNoteInputs] = useState({});
  const [tagInputs, setTagInputs] = useState({});
  const [emotionInputs, setEmotionInputs] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});

  if (!holdings.length) return <p>No holdings</p>;
  if (!prices || Object.keys(prices).length === 0)
    return <p>Loading prices...</p>;

  // ================= SELL FUNCTION =================
  const sellOne = async (symbol) => {
    try {
      if (!symbol) return;

      await api.post("/api/trade/sell", {
        symbol,
        quantity: 1,
        notes: noteInputs[symbol] || "",
        tags: (tagInputs[symbol] || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        emotion: emotionInputs[symbol] || "",
        rating: Number(ratingInputs[symbol]) || 0,
      });

      toast.success(`Sold 1 ${symbol}`);
      refreshWallet();

      // ✅ clear inputs
      setNoteInputs((prev) => ({ ...prev, [symbol]: "" }));
      setTagInputs((prev) => ({ ...prev, [symbol]: "" }));
      setEmotionInputs((prev) => ({ ...prev, [symbol]: "" }));
      setRatingInputs((prev) => ({ ...prev, [symbol]: "" }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Sell failed");
    }
  };

  // ================= DATA =================
  const rows = holdings
    .map((h) => {
      const price = prices[h.symbol];
      if (!price) return null;

      const invested = h.quantity * h.avgPrice;
      const current = h.quantity * price;
      const pl = current - invested;
      const percent = invested !== 0 ? (pl / invested) * 100 : 0;

      const stopLoss = h.stopLoss || h.avgPrice * 0.95;
      const takeProfit = h.takeProfit || h.avgPrice * 1.1;

      return { ...h, price, pl, percent, stopLoss, takeProfit };
    })
    .filter(Boolean);

  const totalPL = rows.reduce((sum, r) => sum + r.pl, 0);
  const totalInvested = rows.reduce(
    (sum, r) => sum + r.quantity * r.avgPrice,
    0
  );

  const totalPercent =
    totalInvested !== 0 ? (totalPL / totalInvested) * 100 : 0;

  // ================= UI =================
  return (
    <div>
      <h3>Portfolio</h3>

      {rows.map((h) => (
        <div
          key={h.symbol}
          style={{
            borderBottom: "1px solid #1f2937",
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <strong>{h.symbol}</strong>
          <br />

          Qty: {h.quantity}
          <br />

          Avg Price: ₹{h.avgPrice.toFixed(2)}
          <br />

          Current Price: ₹{h.price.toFixed(2)}
          <br />

          {/* 📈 Chart */}
          <Sparkline data={priceHistory[h.symbol] || []} />

          {/* 📊 P/L */}
          <span
            style={{
              color: h.pl >= 0 ? "#00c853" : "#ff5252",
              fontWeight: "bold",
            }}
          >
            P/L: ₹{h.pl.toFixed(2)} ({h.percent.toFixed(2)}%)
          </span>

          <br />

          {/* 🎯 SL / TP */}
          <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
            <span style={{ color: "#ff5252" }}>
              SL: ₹{h.stopLoss.toFixed(2)}
            </span>{" "}
            |{" "}
            <span style={{ color: "#00c853" }}>
              TP: ₹{h.takeProfit.toFixed(2)}
            </span>
          </div>

          {/* 📝 NOTES */}
          <textarea
            placeholder="Trade notes..."
            value={noteInputs[h.symbol] || ""}
            onChange={(e) =>
              setNoteInputs((prev) => ({
                ...prev,
                [h.symbol]: e.target.value,
              }))
            }
            style={{ width: "100%", marginTop: "6px" }}
          />

          {/* 🏷 TAGS */}
          <input
            type="text"
            placeholder="Tags (e.g. breakout, news)"
            value={tagInputs[h.symbol] || ""}
            onChange={(e) =>
              setTagInputs((prev) => ({
                ...prev,
                [h.symbol]: e.target.value,
              }))
            }
            style={{ marginTop: "6px", width: "100%" }}
          />

          {/* 😨 EMOTION */}
          <select
            value={emotionInputs[h.symbol] || ""}
            onChange={(e) =>
              setEmotionInputs((prev) => ({
                ...prev,
                [h.symbol]: e.target.value,
              }))
            }
            style={{ marginTop: "6px", width: "100%" }}
          >
            <option value="">Select Emotion</option>
            <option value="confident">😎 Confident</option>
            <option value="fear">😨 Fear</option>
            <option value="greed">🤑 Greed</option>
            <option value="neutral">😐 Neutral</option>
          </select>

          {/* ⭐ RATING */}
          <input
            type="number"
            min="1"
            max="5"
            placeholder="Rating (1-5)"
            value={ratingInputs[h.symbol] || ""}
            onChange={(e) =>
              setRatingInputs((prev) => ({
                ...prev,
                [h.symbol]: e.target.value,
              }))
            }
            style={{ marginTop: "6px", width: "100%" }}
          />

          <br />

          {/* SELL BUTTON */}
          <button onClick={() => sellOne(h.symbol)}>Sell 1</button>
        </div>
      ))}

      {/* 📊 TOTAL */}
      <h4
        style={{
          color: totalPL >= 0 ? "#00c853" : "#ff5252",
        }}
      >
        Total P/L: ₹{totalPL.toFixed(2)} ({totalPercent.toFixed(2)}%)
      </h4>
    </div>
  );
};

export default Portfolio;