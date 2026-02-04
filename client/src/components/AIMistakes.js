import { useEffect, useState } from "react";
import api from "../api/axios";

const AIMistakes = () => {
  const [mistakes, setMistakes] = useState([]);

  useEffect(() => {
    const loadMistakes = async () => {
      try {
        const res = await api.get("/api/analytics/ai-mistakes");
        setMistakes(res.data.mistakes || []);
      } catch (err) {
        console.error("AI mistakes load failed", err);
      }
    };

    loadMistakes();
  }, []);

  return (
    <div className="card">
      <h3>AI Mistake Detector</h3>
      {mistakes.length === 0 ? (
        <p>Scanning your trades...</p>
      ) : (
        <ul>
          {mistakes.map((m, i) => (
            <li key={i}>⚠️ {m}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AIMistakes;
