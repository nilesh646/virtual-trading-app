import { useEffect, useState } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Analytics load failed", err);
      }
    };
    load();
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div>
      <h3>Performance Analytics</h3>

      <p>Total Trades: <strong>{data.totalTrades}</strong></p>
      <p>Wins: <strong style={{ color: "#00c853" }}>{data.wins}</strong></p>
      <p>Losses: <strong style={{ color: "#ff5252" }}>{data.losses}</strong></p>
      <p>Win Rate: <strong>{data.winRate}%</strong></p>
      <p>Total P/L: 
        <strong style={{ color: data.totalPL >= 0 ? "#00c853" : "#ff5252" }}>
          ₹{data.totalPL}
        </strong>
      </p>

      <hr />

      <p>🏆 Best Trade: <strong style={{ color: "#00c853" }}>₹{data.bestTrade}</strong></p>
      <p>💀 Worst Trade: <strong style={{ color: "#ff5252" }}>₹{data.worstTrade}</strong></p>

      <p>🔥 Max Win Streak: <strong>{data.maxWinStreak}</strong></p>
      <p>🥶 Max Loss Streak: <strong>{data.maxLossStreak}</strong></p>

      <p>📈 Avg Win: <strong style={{ color: "#00c853" }}>₹{data.avgWin}</strong></p>
      <p>📉 Avg Loss: <strong style={{ color: "#ff5252" }}>₹{data.avgLoss}</strong></p>
    </div>
  );
};

export default Analytics;
