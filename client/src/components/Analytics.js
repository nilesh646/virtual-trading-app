import { useEffect, useState } from "react";
import api from "../api/axios";
import COLORS from "../styles/colors";

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Analytics load failed", err);
      }
    };
    load();
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  const riskColor =
    data.riskLevel === "HIGH"
      ? "#ff1744"
      : data.riskLevel === "MEDIUM"
      ? "#ff9100"
      : "#00c853";

  const qualityColor =
    data.strategyQuality === "PRO"
      ? "#00c853"
      : data.strategyQuality === "GOOD"
      ? "#ff9100"
      : "#ff5252";

  return (
    <div>
      <h3>Performance & Risk Analytics</h3>

      <p>Total Trades: <strong>{data.totalTrades}</strong></p>
      <p>Wins: <strong style={{ color: COLORS.green}}>{data.wins}</strong></p>
      <p>Losses: <strong style={{ color: "#ff5252" }}>{data.losses}</strong></p>
      <p>Win Rate: <strong>{data.winRate}%</strong></p>

      <p>
        Total P/L:
        <strong style={{ color: data.totalPL >= 0 ? "#00c853" : "#ff5252" }}>
          ₹{data.totalPL}
        </strong>
      </p>

      <hr />

      <p>📉 Max Drawdown: <strong style={{ color: "#ff5252" }}>{data.maxDrawdown}%</strong></p>
      <p>📊 Current Drawdown: <strong>{data.currentDrawdown}%</strong></p>
      <p>🏔 Equity Peak: <strong>₹{data.equityPeak}</strong></p>

      <p>
        ⚠ Risk Level:
        <strong style={{ color: riskColor }}> {data.riskLevel}</strong>
      </p>

      <hr />

      <p>📊 Volatility: <strong>{data.volatility}%</strong></p>
      <p>⭐ Sharpe Ratio: <strong>{data.sharpeRatio}</strong></p>

      <p>
        🧠 Strategy Quality:
        <strong style={{ color: qualityColor }}> {data.strategyQuality}</strong>
      </p>
    </div>
  );
};

export default Analytics;
