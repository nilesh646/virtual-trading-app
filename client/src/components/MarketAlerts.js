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

  const getColor = (priority) => {
    if (priority === "HIGH") return "#ff5252";
    if (priority === "MEDIUM") return "#ffb300";
    return "#64b5f6";
  };

  return (
    <div className="card">
      <h3>Market Alerts</h3>

      {alerts.map((a, i) => (
        <div
          key={i}
          style={{
            padding: "8px",
            marginBottom: "6px",
            borderRadius: "6px",
            background: "#111827",
            borderLeft: `4px solid ${getColor(a.priority)}`
          }}
        >
          <strong style={{ color: getColor(a.priority) }}>
            {a.priority}
          </strong>{" "}
          — {a.message}
        </div>
      ))}
    </div>
  );
};

export default MarketAlerts;
