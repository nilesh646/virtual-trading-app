import { useEffect, useState } from "react";
import api from "../api/axios";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/api/history");
        setHistory(res.data || []);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return <p>Loading trade history...</p>;
  }

  if (history.length === 0) {
    return <p>No trades yet</p>;
  }

  // 🔥 REALIZED P/L (only SELL trades)
  const totalRealizedPL = history
    .filter(trade => trade.type === "SELL")
    .reduce((sum, trade) => sum + (trade.pnl || 0), 0);

  return (
    <div>
      <h3>Order History</h3>

      {history.map((trade, index) => (
        <div key={index} style={{ marginBottom: "10px" }}>
          <strong>{trade.type}</strong> — {trade.symbol}<br />
          Qty: {trade.quantity}<br />
          Price: ₹{trade.price}<br />

          {trade.type === "SELL" && (
            <span
              style={{
                color: trade.pnl >= 0 ? "green" : "red",
                fontWeight: "bold"
              }}
            >
              Realized P/L: ₹{trade.pnl.toFixed(2)}
            </span>
          )}

          <br />
          <small>{new Date(trade.date).toLocaleString()}</small>
          <hr />
        </div>
      ))}

      <h4
        style={{
          color: totalRealizedPL >= 0 ? "green" : "red",
          marginTop: "15px"
        }}
      >
        Total Realized P/L: ₹{totalRealizedPL.toFixed(2)}
      </h4>
    </div>
  );
};

export default History;
