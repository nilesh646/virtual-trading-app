import { Line } from "react-chartjs-2";

const EquityCurveChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No equity data available</p>;
  }

  const chartData = {
    labels: data.map((_, i) => `Trade ${i + 1}`),
    datasets: [
      {
        label: "Equity Curve",
        data: data.map(d => d.equity),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        tension: 0.3
      }
    ]
  };

  return (
    <div>
      <h3>Equity Curve</h3>
      <Line data={chartData} />
    </div>
  );
};

export default EquityCurveChart;
