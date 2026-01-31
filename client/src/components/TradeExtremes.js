import { useEffect, useState } from "react";
import api from "../api/axios";

const TradeExtremes = () => {
  const [data, setData] = useState({ best: null, worst: null });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/trade-extremes");
        setData(res.data || {});
      } catch (err) {
        console.error("Trade extremes load failed", err);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h3>Trade Highlights</h3>

      {data.best ? (
        <div style={{ marginBottom: "10px" }}>
          🏆 <strong>Best Trade</strong><br />
          {data.best.symbol} — ₹{data.best.pl}<br />
          <small>{new Date(data.best.date).toLocaleString()}</small>
        </div>
      ) : (
        <p>No winning trades yet</p>
      )}

      {data.worst ? (
        <div>
          💀 <strong>Worst Trade</strong><br />
          {data.worst.symbol} — ₹{data.worst.pl}<br />
          <small>{new Date(data.worst.date).toLocaleString()}</small>
        </div>
      ) : (
        <p>No losing trades yet</p>
      )}
    </div>
  );
};

export default TradeExtremes;
