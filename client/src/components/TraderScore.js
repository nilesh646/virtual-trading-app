import { useEffect, useState } from "react";
import api from "../api/axios";

const TraderScore = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadScore = async () => {
      try {
        const res = await api.get("/api/analytics/score");
        setData(res.data);
      } catch (err) {
        console.error("Score load failed", err);
      }
    };

    loadScore();
  }, []);

  if (!data) return <p>Calculating trader score...</p>;

  const color =
    data.score >= 80 ? "#00c853" :
    data.score >= 60 ? "#2196f3" :
    data.score >= 40 ? "#ffb300" : "#ff5252";

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Trader Performance Score</h3>
      <div
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color
        }}
      >
        {data.score} / 100
      </div>
      <div style={{ marginTop: "8px", fontWeight: "bold" }}>
        {data.grade}
      </div>
    </div>
  );
};

export default TraderScore;
