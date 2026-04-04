import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import api from "../api/axios";

const DailyPLChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get("/api/analytics/daily-pl")
      .then(res => setData(res.data));
  }, []);

  if (!data.length) return <p>Loading P/L...</p>;

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: "Daily P/L",
        data: data.map(d => d.pl),
        tension: 0.3,
      }
    ]
  };

  return <Line data={chartData} />;
};

export default DailyPLChart;