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

  // ✅ TOTAL REALIZED P/L (SAFE)
  const totalRealizedPL = history.reduce((sum, trade) => {
    const pl = Number(trade.pl || 0);
    if (trade.type === "SELL") {
      return sum + pl;
    }
    return sum;
  }, 0);

  return (
    <div>
      <h3>Order History</h3>

      {history.map((trade, index) => {
        const pl = Number(trade.pl || 0);

        return (
          <div key={index}>
            <strong>{trade.type}</strong> — {trade.symbol}
            <br />
            Qty: {trade.quantity}
            <br />
            Price: ₹{Number(trade.price).toFixed(2)}
            <br />

            {/* 💰 Show P/L only for SELL trades */}
            {trade.type === "SELL" && (
              <span
                style={{
                  color: pl >= 0 ? "#00c853" : "#ff5252",
                  fontWeight: "bold"
                }}
              >
                Realized P/L: ₹{pl.toFixed(2)}
              </span>
            )}

            {/* 🤖 AutoTrader Trigger Reason */}
            {trade.reason && (
              <div
                style={{
                  color: "#ff9800",
                  fontWeight: "bold",
                  marginTop: "4px"
                }}
              >
                Trigger: {trade.reason}
              </div>
            )}

            {trade.notes && (
              <p><strong>Notes:</strong> {trade.notes}</p>
            )}

            {trade.tags && trade.tags.length > 0 && (
              <p>
                <strong>Tags:</strong> {trade.tags.map((t, i) => (
                  <span key={i} style={{
                    background: "#333",
                    color: "#fff",
                    padding: "2px 6px",
                    marginRight: "5px",
                    borderRadius: "4px"
                  }}>
                    {t}
                  </span>
                ))}
              </p>
            )}

            <br />
            <small>{new Date(trade.date).toLocaleString()}</small>
            <hr />
          </div>
        );
      })}

      <h4 style={{ color: totalRealizedPL >= 0 ? "#00c853" : "#ff5252" }}>
        Total Realized P/L: ₹{totalRealizedPL.toFixed(2)}
      </h4>
    </div>
  );
};

export default History;
