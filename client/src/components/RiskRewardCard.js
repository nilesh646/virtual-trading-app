import { useEffect, useState } from "react";
import api from "../api/axios";

const RiskRewardCard = () => {
  const [rrr, setRrr] = useState(null);

  useEffect(() => {
    const loadRRR = async () => {
      try {
        const res = await api.get("/api/analytics/risk-reward");
        setRrr(res.data.rrr);
      } catch (err) {
        console.error("RRR load failed", err);
      }
    };

    loadRRR();
  }, []);

  const getColor = () => {
    if (rrr === "∞") return "#00c853";
    const val = Number(rrr);
    if (val > 1) return "#00c853";
    if (val < 1) return "#ff5252";
    return "#ffab00";
  };

  return (
    <div className="card">
      <h3>Risk-Reward Ratio</h3>
      {rrr !== null ? (
        <p style={{ color: getColor(), fontWeight: "bold" }}>
          {rrr}
        </p>
      ) : (
        <p>Loading RRR...</p>
      )}
    </div>
  );
};

export default RiskRewardCard;
