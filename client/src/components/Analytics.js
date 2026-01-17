import { useEffect, useState } from "react";
import api from "../api/axios";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/analytics").then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <div>
      <h3>Trading Analytics</h3>
      <p>Total Invested: ₹{data.totalInvested}</p>
      <p>Total Sold: ₹{data.totalSold}</p>
      <p>
        Net P/L:{" "}
        <span style={{ color: data.netPL >= 0 ? "green" : "red" }}>
          ₹{data.netPL}
        </span>
      </p>
      <p>Buys: {data.buyCount}</p>
      <p>Sells: {data.sellCount}</p>
    </div>
  );
};

export default Analytics;
