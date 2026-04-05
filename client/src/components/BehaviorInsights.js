import { useEffect, useState } from "react";
import api from "../api/axios";

const BehaviorInsights = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/api/analytics/behavior")
      .then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading behavior...</p>;

  return (
    <div>
      <h3>🧠 Behavior Insights</h3>
      <p>⭐ Avg Rating: {data.avgRating}</p>

      <h4>Emotions:</h4>
      {Object.entries(data.emotions).map(([e, count]) => (
        <p key={e}>{e}: {count}</p>
      ))}
    </div>
  );
};

export default BehaviorInsights;