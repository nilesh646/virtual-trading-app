const RiskMeter = ({ holdings = [] }) => {
  if (!holdings.length) return <p>No holdings to calculate risk</p>;

  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.quantity * h.avgPrice,
    0
  );

  const weights = holdings.map(
    h => (h.quantity * h.avgPrice) / totalInvested
  );

  const maxWeight = Math.max(...weights) * 100; // in %

  let level = "Low";
  let color = "#00c853";

  if (maxWeight > 60) {
    level = "High";
    color = "#ff5252";
  } else if (maxWeight > 35) {
    level = "Medium";
    color = "#ffd600";
  }

  return (
    <div>
      <h3>Portfolio Risk Meter</h3>
      <div style={{
        height: "20px",
        background: "#eee",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "10px"
      }}>
        <div
          style={{
            width: `${maxWeight}%`,
            background: color,
            height: "100%"
          }}
        />
      </div>

      <p>
        Largest Position: <strong>{maxWeight.toFixed(1)}%</strong><br />
        Risk Level: <strong style={{ color }}>{level}</strong>
      </p>
    </div>
  );
};

export default RiskMeter;
