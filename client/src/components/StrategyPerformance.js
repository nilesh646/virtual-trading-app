import { useEffect, useState } from "react";
import api from "../api/axios";

const StrategyPerformance = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/strategies");
        setData(res.data || []);
      } catch (err) {
        console.error("Strategy performance load failed", err);
      }
    };
    load();
  }, []);

  if (!data.length) return <p>No tagged trades yet</p>;

  return (
    <div>
      <h3>Strategy Performance</h3>

      {data.map((s) => (
        <div key={s.tag}>
          <strong>#{s.tag}</strong>
          <br />
          Trades: {s.trades}
          <br />
          Wins: {s.wins} | Losses: {s.losses}
          <br />
          Win Rate: {s.winRate}%
          <br />
          <span style={{ color: s.totalPL >= 0 ? "#00c853" : "#ff5252" }}>
            Total P/L: ₹{Number(s.totalPL).toFixed(2)}
          </span>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default StrategyPerformance;
