import { useEffect, useState } from "react";
import api from "../api/axios";

const SortinoCard = () => {
  const [sortino, setSortino] = useState(null);

  useEffect(() => {
    const loadSortino = async () => {
      try {
        const res = await api.get("/api/analytics/sortino");
        setSortino(res.data.sortino);
      } catch (err) {
        console.error("Sortino load failed", err);
      }
    };

    loadSortino();
  }, []);

  const getColor = () => {
    const value = Number(sortino);
    if (value >= 2) return "#00c853";
    if (value >= 1) return "#ffab00";
    return "#ff5252";
  };

  return (
    <div className="card">
      <h3>Sortino Ratio</h3>
      {sortino !== null ? (
        <p style={{ color: getColor(), fontWeight: "bold" }}>
          {sortino}
        </p>
      ) : (
        <p>Loading Sortino...</p>
      )}
    </div>
  );
};

export default SortinoCard;
