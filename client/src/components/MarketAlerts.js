import { useEffect, useState } from "react";
import api from "../api/axios";

const MarketAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  const loadAlerts = async () => {
    try {
      const res = await api.get("/api/alerts");
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Alert load failed");
    }
  };

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(loadAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!alerts.length) return null;

  return (
    <div className="card">
      <h3>Market Alerts</h3>

      {alerts.map((a, i) => (
        <div
          key={i}
          style={{
            padding: "6px",
            borderBottom: "1px solid #eee"
          }}
        >
          {a.message}
        </div>
      ))}
    </div>
  );
};

export default MarketAlerts;
