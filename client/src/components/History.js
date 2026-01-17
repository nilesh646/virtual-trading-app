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

  if (loading) return <p>Loading trade history...</p>;
  if (!history.length) return <p>No trades yet</p>;

  // ✅ SAFE realized P/L calculation
  const totalRealizedPL = history.reduce((sum, trade) => {
    if (trade.type === "SELL" && typeof trade.pnl === "number") {
      return sum + trade.pnl;
    }
    return sum;
  }, 0);

  return (
    <div>
      <h3>Order History</h3>

      {history.map((trade, index) => (
        <div key={index}>
          <strong>{trade.type}</strong> — {trade.symbol}<br />
          Qty: {trade.quantity}<br />
          Price: ₹{trade.price}<br />

          {trade.type === "SELL" && typeof trade.pnl === "number" && (
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

      <h4 style={{ color: totalRealizedPL >= 0 ? "green" : "red" }}>
        Total Realized P/L: ₹{totalRealizedPL.toFixed(2)}
      </h4>
    </div>
  );
};

export default History;
