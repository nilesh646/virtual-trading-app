import { useMemo } from "react";

const MarketAlerts = ({ prices = {} }) => {

  // ✅ SAFE ALERT GENERATION
  const alerts = useMemo(() => {
    const list = [];

    Object.entries(prices).forEach(([symbol, stock]) => {
      const price = Number(stock?.price ?? 0);
      const change = Number(stock?.changePercent ?? 0);

      // skip invalid data
      if (!price || isNaN(price)) return;

      if (change > 1.5) {
        list.push({
          symbol,
          type: "breakout",
          message: "🔥 Strong breakout"
        });
      } else if (change > 0.8) {
        list.push({
          symbol,
          type: "momentum",
          message: "🚀 Strong momentum"
        });
      } else if (change < -1.2) {
        list.push({
          symbol,
          type: "drop",
          message: "⚠ Sharp drop"
        });
      }
    });

    return list.slice(0, 5);
  }, [prices]);

  // ✅ guard AFTER hooks
  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading alerts...</p>;
  }

  if (!alerts.length) {
    return <p>No major alerts</p>;
  }

  return (
    <div>
      <h3>Market Alerts</h3>

      {alerts.map((a, i) => (
        <div
          key={i}
          style={{
            background: "#1e293b",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "8px"
          }}
        >
          <strong>{a.symbol}</strong> — {a.message}
        </div>
      ))}
    </div>
  );
};

export default MarketAlerts;
