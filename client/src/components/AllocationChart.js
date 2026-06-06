import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "./AllocationChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  "#7b61ff", "#00d68f", "#ff4d6d", "#f5a623",
  "#00c8ff", "#ff6b35", "#a8ff78", "#ff9de2",
];

const AllocationChart = ({ holdings = [] }) => {
  if (!holdings.length)
    return (
      <div className="ac-empty">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17" stroke="#2a2a3d" strokeWidth="1.5" />
          <path d="M18 18L18 6" stroke="#4a4a6a" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 18L28 24" stroke="#4a4a6a" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>No holdings to display</span>
      </div>
    );

  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.quantity * h.avgPrice, 0
  );

  const slices = holdings.map((h, i) => ({
    symbol: h.symbol,
    value: h.quantity * h.avgPrice,
    pct: ((h.quantity * h.avgPrice) / totalInvested * 100),
    color: PALETTE[i % PALETTE.length],
  }));

  const chartData = {
    labels: slices.map(s => s.symbol),
    datasets: [{
      data: slices.map(s => s.pct.toFixed(2)),
      backgroundColor: slices.map(s => s.color),
      borderColor: "#0f0f1a",
      borderWidth: 3,
      hoverOffset: 8,
      hoverBorderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "62%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1a28",
        borderColor: "#2f2f50",
        borderWidth: 1,
        titleColor: "#e8e8f0",
        bodyColor: "#9090b0",
        padding: 12,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.toFixed(2)}% · ₹${slices[ctx.dataIndex].value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
        },
      },
    },
  };

  const largest = [...slices].sort((a, b) => b.pct - a.pct)[0];

  return (
    <div className="ac-root">
      <div className="ac-header">
        <h3 className="ac-title">Allocation</h3>
        <span className="ac-total">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
      </div>

      <div className="ac-body">
        {/* Donut chart */}
        <div className="ac-chart-wrap">
          <Pie data={chartData} options={options} />
          <div className="ac-center-label">
            <span className="ac-center-sym">{largest.symbol}</span>
            <span className="ac-center-pct">{largest.pct.toFixed(1)}%</span>
            <span className="ac-center-sub">largest</span>
          </div>
        </div>

        {/* Legend */}
        <div className="ac-legend">
          {slices.map((s) => (
            <div key={s.symbol} className="ac-legend-row">
              <span className="ac-legend-dot" style={{ background: s.color }} />
              <span className="ac-legend-sym">{s.symbol}</span>
              <div className="ac-legend-bar-wrap">
                <div className="ac-legend-bar" style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
              <span className="ac-legend-pct">{s.pct.toFixed(1)}%</span>
              <span className="ac-legend-val">₹{s.value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllocationChart;
