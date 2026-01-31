import { useEffect, useState } from "react";
import api from "../api/axios";

const MonthlyReport = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/monthly");
        setData(res.data || []);
      } catch (err) {
        console.error("Monthly report load failed", err);
      }
    };

    load();
  }, []);

  if (!data.length) return <p>No monthly data yet</p>;

  return (
    <div>
      <h3>Monthly Performance</h3>

      {data.map((m, i) => (
        <div key={i}>
          <strong>{m.month}</strong><br />
          Trades: {m.trades} | Win Rate: {m.winRate}%<br />
          <span style={{ color: m.totalPL >= 0 ? "#00c853" : "#ff5252" }}>
            Total P/L: ₹{m.totalPL}
          </span>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default MonthlyReport;
