import { useEffect, useState } from "react";
import api from "../api/axios";

const TradeLeaders = () => {
  const [leaders, setLeaders] = useState(null);

  useEffect(() => {
    api.get("/api/analytics/leaders").then(res => setLeaders(res.data));
  }, []);

  if (!leaders) return null;

  return (
    <div className="card">
      <h3>🏆 Trade Performance</h3>

      {leaders.best && (
        <div style={{ color: "#00c853" }}>
          Best: {leaders.best.symbol} ₹{leaders.best.pl.toFixed(2)}
        </div>
      )}

      {leaders.worst && (
        <div style={{ color: "#ff5252" }}>
          Worst: {leaders.worst.symbol} ₹{leaders.worst.pl.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default TradeLeaders;
