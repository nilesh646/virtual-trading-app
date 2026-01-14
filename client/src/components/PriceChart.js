import { Line } from "react-chartjs-2";

const PriceChart = ({ prices }) => {
  const labels = Object.keys(prices);
  const dataPoints = Object.values(prices);

  if (!labels.length) return null;

  const data = {
    labels,
    datasets: [
      {
        label: "Live Stock Prices",
        data: dataPoints,
        borderColor: "blue",
        tension: 0.4
      }
    ]
  };

  return <Line data={data} />;
};

export default PriceChart;
