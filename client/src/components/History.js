import { useEffect, useState } from "react";
import api from "../api/axios";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("all");

  const loadHistory = async (tag = "all") => {
    try {
      setLoading(true);
      const res = await api.get(`/api/history?tag=${tag}`);
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(selectedTag);
  }, [selectedTag]);

  const downloadCSV = () => {
    const token = localStorage.getItem("token");

    window.open(
      `https://virtual-trading-app-kcdu.onrender.com/api/history/export?token=${token}`,
      "_blank"
    );
  };

  if (loading) return <p>Loading trade history...</p>;
  if (!history.length) return <p>No trades for this filter</p>;

  const totalRealizedPL = history.reduce((sum, trade) => {
    const pl = Number(trade.pl || 0);
    return trade.type === "SELL" ? sum + pl : sum;
  }, 0);

  return (
    <div>
      <h3>Order History</h3>

      {/* 📥 CSV EXPORT BUTTON */}
      <button
        onClick={downloadCSV}
        style={{
          marginBottom: "10px",
          padding: "6px 12px",
          background: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        📥 Download Trade History
      </button>

      {/* 🔥 STRATEGY FILTER */}
      <div style={{ marginBottom: "10px" }}>
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="all">All Trades</option>
          <option value="breakout">Breakout</option>
          <option value="news">News</option>
          <option value="scalp">Scalp</option>
          <option value="swing">Swing</option>
        </select>
      </div>

      {history.map((trade, index) => {
        const pl = Number(trade.pl || 0);

        return (
          <div key={index}>
            <strong>{trade.type}</strong> — {trade.symbol}
            <br />
            Qty: {trade.quantity}
            <br />
            Price: ₹{trade.price}
            <br />

            {trade.tags?.length > 0 && (
              <div style={{ fontSize: "0.8rem", color: "#555" }}>
                Tags: {trade.tags.join(", ")}
              </div>
            )}

            {trade.notes && (
              <div style={{ fontSize: "0.8rem", color: "#777" }}>
                Notes: {trade.notes}
              </div>
            )}

            {trade.type === "SELL" && (
              <span
                style={{
                  color: pl >= 0 ? "green" : "red",
                  fontWeight: "bold"
                }}
              >
                Realized P/L: ₹{pl.toFixed(2)}
              </span>
            )}

            <br />
            <small>{new Date(trade.date).toLocaleString()}</small>
            <hr />
          </div>
        );
      })}

      <h4 style={{ color: totalRealizedPL >= 0 ? "green" : "red" }}>
        Total Realized P/L: ₹{totalRealizedPL.toFixed(2)}
      </h4>
    </div>
  );
};

export default History;
