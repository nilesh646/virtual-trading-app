import { Line } from "react-chartjs-2";

const PortfolioChart = ({ data = [] }) => {
  if (!data.length) return <p>No portfolio data</p>;
  

  const chartData = {
    labels: data.map((_, i) => i),
    pointRadius: data.map(d => d.equity > 100000 ? 4 : 2),
    datasets: [
      {
        label: "Portfolio Value",
        data: data.map(d => d.equity),
        tension: 0.3,
      }
    ]
  };

  return <Line data={chartData} />;
};

export default PortfolioChart;