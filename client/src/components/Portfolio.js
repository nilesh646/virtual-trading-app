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
  const [tagInputs, setTagInputs] = useState({}); // ✅ per-stock tags

  if (!holdings.length) return <p>No holdings</p>;
  if (!prices || Object.keys(prices).length === 0)
    return <p>Loading prices...</p>;

  const sellOne = async (symbol) => {
    try {
      await api.post("/api/trade/sell", {
        symbol,
        quantity: 1,
        notes: noteInputs[symbol] || "",
        tags: (tagInputs[symbol] || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      toast.success(`Sold 1 ${symbol}`);
      refreshWallet();

      // Clear inputs after sell
      setNoteInputs((prev) => ({ ...prev, [symbol]: "" }));
      setTagInputs((prev) => ({ ...prev, [symbol]: "" }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Sell failed");
    }
  };

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

  return (
    <div>
      <h3>Portfolio</h3>

      {rows.map((h) => (
        <div key={h.symbol}>
          <strong>{h.symbol}</strong>
          <br />
          Qty: {h.quantity}
          <br />
          Avg Price: ₹{h.avgPrice.toFixed(2)}
          <br />
          Current Price: ₹{h.price.toFixed(2)}
          <br />

          <Sparkline data={priceHistory[h.symbol] || []} />

          <span
            style={{
              color: h.pl >= 0 ? "#00c853" : "#ff5252",
              fontWeight: "bold",
            }}
          >
            P/L: ₹{h.pl.toFixed(2)} ({h.percent.toFixed(2)}%)
          </span>

          <br />

          <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>
            <span style={{ color: "#ff5252" }}>
              SL: ₹{h.stopLoss.toFixed(2)}
            </span>{" "}
            |{" "}
            <span style={{ color: "#00c853" }}>
              TP: ₹{h.takeProfit.toFixed(2)}
            </span>
          </div>

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

          <br />
          <button onClick={() => sellOne(h.symbol)}>Sell 1</button>
          <hr />
        </div>
      ))}

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
