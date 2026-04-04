import { useEffect, useState } from "react";
import api from "../api/axios";

const AIRecommendations = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/api/analytics/recommendations")
      .then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h3>🤖 AI Recommendations</h3>
      {data.map((item, i) => (
        <p key={i}>{item.symbol}: {item.advice}</p>
      ))}
    </div>
  );
};

export default AIRecommendations;