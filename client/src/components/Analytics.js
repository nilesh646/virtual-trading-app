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

  return (
    <div>
      <h3>Trading Analytics</h3>

      <p>Total Trades: {data.totalTrades}</p>
      <p>Winning Trades: {data.wins}</p>
      <p>Losing Trades: {data.losses}</p>
      <p>Win Rate: {data.winRate}%</p>

      <p style={{ color: data.totalPL >= 0 ? "green" : "red" }}>
        Total P/L: ₹{data.totalPL}
      </p>
    </div>
  );
};

export default Analytics;
