import { useEffect, useState } from "react";
import api from "../api/axios";

const StrategyStats = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/strategy-performance");
        setData(res.data);
      } catch (err) {
        console.error("Strategy stats load failed", err);
      }
    };
    load();
  }, []);

  if (!data.length) return <p>No strategy data yet</p>;

  return (
    <div>
      <h3>Strategy Performance</h3>

      {data.map(s => (
        <div key={s.strategy}>
          <strong>{s.strategy}</strong>
          <br />
          Trades: {s.trades}
          <br />
          Win Rate: {s.winRate.toFixed(1)}%
          <br />
          <span style={{ color: s.totalPL >= 0 ? "#00c853" : "#ff5252" }}>
            Total P/L: ₹{s.totalPL.toFixed(2)}
          </span>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default StrategyStats;
