import { useEffect, useState } from "react";
import api from "../api/axios";

const ProfitFactorCard = () => {
  const [pf, setPf] = useState(null);

  useEffect(() => {
    const loadPF = async () => {
      try {
        const res = await api.get("/api/analytics/profit-factor");
        setPf(res.data.profitFactor);
      } catch (err) {
        console.error("Profit factor load failed", err);
      }
    };

    loadPF();
  }, []);

  const getColor = () => {
    if (pf === "∞") return "#00c853";
    const value = Number(pf);
    if (value >= 2) return "#00c853";
    if (value >= 1) return "#ffab00";
    return "#ff5252";
  };

  return (
    <div className="card">
      <h3>Profit Factor</h3>
      {pf !== null ? (
        <p style={{ color: getColor(), fontWeight: "bold" }}>
          {pf}
        </p>
      ) : (
        <p>Loading Profit Factor...</p>
      )}
    </div>
  );
};

export default ProfitFactorCard;
