import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import api from "../api/axios";

const StrategyEquityCurves = () => {
  const [curves, setCurves] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/strategy-curve");
        setCurves(res.data || {});
      } catch (err) {
        console.error("Strategy curve load failed", err);
      }
    };
    load();
  }, []);

  if (!Object.keys(curves).length) return <p>No strategy data yet</p>;

  return (
    <div>
      <h3>Strategy Equity Curves</h3>

      {Object.entries(curves).map(([tag, curve]) => {
        const labels = curve.data.map((_, i) => i + 1);
        const equity = curve.data.map(p => p.equity);

        return (
          <div key={tag} style={{ marginBottom: "20px" }}>
            <strong>#{tag}</strong>
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: `${tag} Equity`,
                    data: equity,
                    borderColor: "#36a2eb",
                    tension: 0.3
                  }
                ]
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StrategyEquityCurves;
