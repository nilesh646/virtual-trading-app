import { useEffect, useState } from "react";
import api from "../api/axios";

const AIInsights = () => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const res = await api.get("/api/analytics/ai-insights");
        setInsights(res.data.insights || []);
      } catch (err) {
        console.error("AI insights load failed", err);
      }
    };

    loadInsights();
  }, []);

  return (
    <div className="card">
      <h3>AI Trade Coach</h3>
      {insights.length === 0 ? (
        <p>Analyzing your trades...</p>
      ) : (
        <ul>
          {insights.map((insight, i) => (
            <li key={i}>🤖 {insight}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AIInsights;
