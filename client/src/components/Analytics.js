import { useEffect, useState } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/analytics").then(res => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <div>
      <h3>Portfolio Analytics</h3>

      <p><strong>Cash Balance:</strong> ₹{data.balance}</p>
      <p><strong>Total Invested:</strong> ₹{data.totalInvested}</p>
      <p><strong>Total Portfolio Value:</strong> ₹{data.totalValue}</p>

      <p style={{ color: data.totalPnL >= 0 ? "green" : "red" }}>
        <strong>Total P/L:</strong> ₹{data.totalPnL}
      </p>

      <h4>Per-Stock Breakdown</h4>
      {data.breakdown.map((b, i) => (
        <div key={i}>
          {b.symbol} | Qty: {b.quantity} | Avg: ₹{b.avgPrice} |
          Live: ₹{b.currentPrice} |
          <span style={{ color: b.pnl >= 0 ? "green" : "red" }}>
            P/L: ₹{b.pnl}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Analytics;
