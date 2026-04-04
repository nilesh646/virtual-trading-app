import { Line } from "react-chartjs-2";

const PriceChart = ({ data = [] }) => {
  if (!data.length) return <p>No chart data</p>;

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        label: "Price",
        data: data,
        tension: 0.3,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  return <Line data={chartData} options={options} />;
};

export default PriceChart;
