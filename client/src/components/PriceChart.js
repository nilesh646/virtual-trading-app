import { Line } from "react-chartjs-2";

const PriceChart = ({ prices }) => {
  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading chart data...</p>;
  }

  const labels = Object.keys(prices);
  const dataValues = Object.values(prices);

  const data = {
    labels,
    datasets: [
      {
        label: "Live Prices",
        data: dataValues,
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.1)"
      }
    ]
  };

  return (
    <div>
      <h3>Market Prices</h3>
      <Line data={data} />
    </div>
  );
};

export default PriceChart;
