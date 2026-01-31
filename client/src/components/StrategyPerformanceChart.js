import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const StrategyPerformanceChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/strategy-performance");
        setData(res.data || []);
      } catch (err) {
        console.error("Strategy chart load failed", err);
      }
    };
    load();
  }, []);

  if (!data.length) return <p>No strategy data yet</p>;

  return (
    <div>
      <h3>Strategy Performance</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="strategy" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalPL" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StrategyPerformanceChart;
