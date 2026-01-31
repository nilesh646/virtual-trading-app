import { useEffect, useState } from "react";
import api from "../api/axios";

const SharpeCard = () => {
  const [sharpe, setSharpe] = useState(null);

  useEffect(() => {
    const loadSharpe = async () => {
      try {
        const res = await api.get("/api/analytics/sharpe");
        setSharpe(res.data.sharpe);
      } catch (err) {
        console.error("Sharpe load failed", err);
      }
    };

    loadSharpe();
  }, []);

  const getColor = () => {
    const value = Number(sharpe);
    if (value >= 2) return "#00c853";
    if (value >= 1) return "#ffab00";
    return "#ff5252";
  };

  return (
    <div className="card">
      <h3>Sharpe Ratio</h3>
      {sharpe !== null ? (
        <p style={{ color: getColor(), fontWeight: "bold" }}>
          {sharpe}
        </p>
      ) : (
        <p>Loading Sharpe...</p>
      )}
    </div>
  );
};

export default SharpeCard;
