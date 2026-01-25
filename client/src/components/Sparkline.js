import { Line } from "react-chartjs-2";

const Sparkline = ({ data = [] }) => {
  if (!data.length) return null;

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        data,
        borderColor: data[data.length - 1] >= data[0] ? "#00c853" : "#ff5252",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return <Line data={chartData} options={options} height={50} />;
};

export default Sparkline;
