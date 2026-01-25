import { Pie } from "react-chartjs-2";

const AllocationChart = ({ holdings = [] }) => {
  if (!holdings.length) return <p>No holdings for allocation</p>;

  // Calculate total invested amount
  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.quantity * h.avgPrice,
    0
  );

  const data = {
    labels: holdings.map(h => h.symbol),
    datasets: [
      {
        data: holdings.map(h =>
          ((h.quantity * h.avgPrice) / totalInvested * 100).toFixed(2)
        ),
      },
    ],
  };

  return (
    <div>
      <h3>Portfolio Allocation</h3>
      <Pie data={data} />
    </div>
  );
};

export default AllocationChart;
