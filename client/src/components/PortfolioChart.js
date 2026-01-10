import { Pie } from "react-chartjs-2";

const PortfolioChart = ({ holdings }) => {
  if (!holdings || holdings.length === 0) return null;

  const data = {
    labels: holdings.map(h => h.symbol),
    datasets: [
      {
        data: holdings.map(h => h.quantity * h.avgPrice),
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#f44336"]
      }
    ]
  };

  return <Pie data={data} />;
};

export default PortfolioChart;
