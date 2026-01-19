import { useEffect, useState } from "react";
import api from "../api/axios";
import { Line } from "react-chartjs-2";

const EquityCurve = () => {
  const [curve, setCurve] = useState([]);

  useEffect(() => {
    api.get("/api/analytics/equity-curve")
      .then(res => setCurve(res.data))
      .catch(err => console.error("Equity curve failed", err));
  }, []);

  if (!curve.length) return <p>No equity data yet</p>;

  const data = {
    labels: curve.map(p => p.index),
    datasets: [
      {
        label: "Equity Curve",
        data: curve.map(p => p.equity),
        borderColor: "blue",
        tension: 0.3
      }
    ]
  };

  return (
    <div>
      <h3>Equity Curve</h3>
      <Line data={data} />
    </div>
  );
};

export default EquityCurve;
