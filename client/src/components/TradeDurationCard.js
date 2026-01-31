import { useEffect, useState } from "react";
import api from "../api/axios";

const TradeDurationCard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadDuration = async () => {
      try {
        const res = await api.get("/api/analytics/trade-duration");
        setData(res.data);
      } catch (err) {
        console.error("Duration load failed", err);
      }
    };

    loadDuration();
  }, []);

  if (!data) return <p>Loading trade duration...</p>;

  return (
    <div className="card">
      <h3>Trade Duration</h3>
      <p style={{ color: "#00c853" }}>
        Avg Win Duration: <b>{data.avgWinMinutes} min</b>
      </p>
      <p style={{ color: "#ff5252" }}>
        Avg Loss Duration: <b>{data.avgLossMinutes} min</b>
      </p>
    </div>
  );
};

export default TradeDurationCard;
