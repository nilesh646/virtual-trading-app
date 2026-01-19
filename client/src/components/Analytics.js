import { useEffect, useState } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/api/analytics")
      .then(res => setStats(res.data))
      .catch(() => setStats(null));
  }, []);

  if (!stats) return <p>Loading analytics...</p>;

  return (
    <div>
      <h3>Performance Analytics</h3>
      <p>Total Trades: {stats.totalTrades}</p>
      <p>Wins: {stats.wins}</p>
      <p>Losses: {stats.losses}</p>
      <p>Win Rate: {stats.winRate}%</p>
      <p>Total P/L: ₹{stats.totalPL}</p>
    </div>
  );
};

export default Analytics;
