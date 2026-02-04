import { useEffect, useState } from "react";
import api from "../api/axios";

const AITradeScores = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const loadScores = async () => {
      try {
        const res = await api.get("/api/analytics/ai-trade-scores");
        setScores(res.data || []);
      } catch (err) {
        console.error("Trade score load failed", err);
      }
    };

    loadScores();
  }, []);

  if (!scores.length) return <p>Analyzing trade quality...</p>;

  return (
    <div className="card">
      <h3>AI Trade Quality Scores</h3>

      {scores.map((trade, i) => (
        <div key={i} style={{ marginBottom: "10px" }}>
          <strong>{trade.symbol}</strong> — {new Date(trade.date).toLocaleDateString()}
          <br />
          P/L: ₹{trade.pl.toFixed(2)}
          <br />
          Score:{" "}
          <span
            style={{
              fontWeight: "bold",
              color:
                trade.score >= 75
                  ? "#00c853"
                  : trade.score >= 50
                  ? "#ff9800"
                  : "#ff5252"
            }}
          >
            {trade.score}/100
          </span>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default AITradeScores;
