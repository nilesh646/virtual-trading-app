import { useEffect, useState } from "react";
import api from "../api/axios";

const StrategyBreakdown = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/strategy-performance");
        setData(res.data);
      } catch (err) {
        console.error("Strategy performance load failed", err);
      }
    };

    load();
  }, []);

  if (!data.length) return <p>Loading strategy analytics...</p>;

  return (
    <div className="card">
      <h3>Strategy Performance</h3>

      {data.map((s, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <strong>{s.strategy.toUpperCase()}</strong><br />
          Trades: {s.trades}<br />
          Win Rate: {s.winRate}%<br />
          Avg P/L: ₹{s.avgPL}<br />
          Total P/L: 
          <span style={{ color: s.totalPL >= 0 ? "#00c853" : "#ff5252" }}>
            ₹{s.totalPL}
          </span>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default StrategyBreakdown;
