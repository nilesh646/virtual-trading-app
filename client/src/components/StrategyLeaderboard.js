import { useEffect, useState } from "react";
import api from "../api/axios";

const StrategyLeaderboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/strategies");
        setData(res.data || []);
      } catch (err) {
        console.error("Strategy load failed", err);
      }
    };

    load();
  }, []);

  if (!data.length) return <p>No strategy data yet</p>;

  return (
    <div>
      <h3>Strategy Performance</h3>

      {data.map((s, i) => (
        <div key={s.tag}>
          <strong>#{i + 1} {s.tag}</strong><br />
          Trades: {s.trades} | Win Rate: {s.winRate}%<br />
          <span style={{ color: s.totalPL >= 0 ? "#00c853" : "#ff5252" }}>
            Total P/L: ₹{s.totalPL}
          </span>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default StrategyLeaderboard;
