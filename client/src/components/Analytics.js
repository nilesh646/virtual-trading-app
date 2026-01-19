import { useEffect, useState } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/analytics")
      .then(res => setData(res.data))
      .catch(() => {});
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div>
      <h3>Performance Analytics</h3>
      <p>Total Trades: {data.totalTrades}</p>
      <p>Wins: {data.wins}</p>
      <p>Losses: {data.losses}</p>
      <p>Win Rate: {data.winRate}%</p>
      <p>Total P/L: ₹{Number(data.totalPL).toFixed(2)}</p>
      <p>Max Drawdown: {data.maxDrawdown}%</p>
      <p>Sharpe Ratio: {data.sharpeRatio}</p>
    </div>
  );
};

export default Analytics;

