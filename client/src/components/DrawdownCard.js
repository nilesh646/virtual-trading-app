import { useEffect, useState } from "react";
import api from "../api/axios";

const DrawdownCard = () => {
  const [drawdown, setDrawdown] = useState(null);

  useEffect(() => {
    const loadDrawdown = async () => {
      try {
        const res = await api.get("/api/analytics/drawdown");
        setDrawdown(res.data.maxDrawdownPercent);
      } catch (err) {
        console.error("Drawdown load failed", err);
      }
    };

    loadDrawdown();
  }, []);

  return (
    <div className="card">
      <h3>Max Drawdown</h3>
      {drawdown !== null ? (
        <p style={{ color: "#ff5252", fontWeight: "bold" }}>
          {drawdown}%
        </p>
      ) : (
        <p>Loading drawdown...</p>
      )}
    </div>
  );
};

export default DrawdownCard;
