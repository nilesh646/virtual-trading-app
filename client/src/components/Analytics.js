import { useEffect, useState } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get("/api/analytics");
        setStats(res.data);
      } catch (err) {
        console.error("Analytics load failed");
      }
    };

    loadStats();
  }, []);

  if (!stats) return <p>Loading analytics...</p>;

  return (
    <div>
      <h3>Performance Analytics</h3>

      <p>Total Trades: {stats.totalTrades}</p>
      <p>Wins: {stats.wins} | Losses: {stats.losses}</p>
      <p>Win Rate: {stats.winRate}%</p>
      <p>Total P/L: ₹{stats.totalPL}</p>

      <hr />

      <p>📈 Avg Win: ₹{stats.avgWin}</p>
      <p>📉 Avg Loss: ₹{stats.avgLoss}</p>
      <p>⚖️ Risk/Reward: {stats.riskReward}</p>
      <p>💰 Profit Factor: {stats.profitFactor}</p>
      <p>🎯 Expectancy per Trade: ₹{stats.expectancy}</p>
    </div>
  );
};

export default Analytics;
