import { useEffect, useState } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/analytics")
      .then(res => setData(res.data))
      .catch(err => console.error("Analytics load failed", err));
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  const totalPL = Number(data.totalPL || 0);
  const winRate = Number(data.winRate || 0);

  return (
    <div>
      <h3>Portfolio Analytics</h3>
      <p>Total Trades: {data.totalTrades}</p>
      <p>Wins: {data.wins}</p>
      <p>Losses: {data.losses}</p>
      <p>Win Rate: {winRate.toFixed(2)}%</p>
      <p style={{ color: totalPL >= 0 ? "green" : "red" }}>
        Total P/L: ₹{totalPL.toFixed(2)}
      </p>
    </div>
  );
};

export default Analytics;
