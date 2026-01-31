import { useEffect, useState } from "react";
import api from "../api/axios";

const DailyPLChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/daily-pl");
        setData(res.data || []);
      } catch (err) {
        console.error("Daily PL load failed", err);
      }
    };

    load();
  }, []);

  if (!data.length) return <p>No completed trades yet</p>;

  return (
    <div>
      <h3>Daily Performance</h3>

      {data.map(day => (
        <div key={day.date} style={{ marginBottom: "6px" }}>
          <strong>{day.date}</strong>{" "}
          <span
            style={{
              color: day.pl >= 0 ? "#00c853" : "#ff5252",
              fontWeight: "bold"
            }}
          >
            ₹{day.pl.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DailyPLChart;
