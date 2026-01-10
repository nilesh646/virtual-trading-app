import { Line } from "react-chartjs-2";

const PriceChart = ({ symbol, prices }) => {
  const data = {
    labels: prices.map((_, i) => `T-${prices.length - i}`),
    datasets: [
      {
        label: `${symbol} Price`,
        data: prices,
        borderColor: "blue",
        fill: false
      }
    ]
  };

  return <Line data={data} />;
};

export default PriceChart;
