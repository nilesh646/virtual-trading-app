import { useEffect, useState } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await api.get("/api/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Analytics load failed", err);
      }
    };

    loadAnalytics();
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div>
      <h3>Portfolio Analytics</h3>

      <p>Total Trades: {data.totalTrades}</p>
      <p>Wins: {data.wins}</p>
      <p>Losses: {data.losses}</p>
      <p>Win Rate: {data.winRate}%</p>

      <h4
        style={{
          color: data.totalPL >= 0 ? "green" : "red"
        }}
      >
        Total P/L: ₹{data.totalPL.toFixed(2)}
      </h4>
    </div>
  );
};

export default Analytics;
