import { useEffect, useState } from "react";
import api from "../api/axios";

const TradeMistakes = () => {
  const [mistakes, setMistakes] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/mistakes");
        setMistakes(res.data.mistakes || []);
      } catch (err) {
        console.error("Mistake analysis failed", err);
      }
    };

    load();
  }, []);

  if (!mistakes.length) return <p>Analyzing your trading behavior...</p>;

  return (
    <div className="card">
      <h3>AI Trade Psychology Insights</h3>

      {mistakes.map((m, i) => (
        <div key={i} style={{ marginBottom: "8px", color: "#ff5252" }}>
          ⚠ {m}
        </div>
      ))}
    </div>
  );
};

export default TradeMistakes;
