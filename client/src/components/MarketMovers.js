const MarketMovers = ({ prices }) => {
  if (!prices || Object.keys(prices).length === 0) return null;

  const stocks = Object.values(prices);

  const sorted = [...stocks].sort((a, b) => b.changePercent - a.changePercent);

  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  return (
    <div className="flex">
      <div className="card" style={{ flex: 1 }}>
        <h3>📈 Top Gainers</h3>
        {gainers.map(s => (
          <div key={s.symbol}>
            {s.symbol} — <span style={{ color: "#00c853" }}>
              +{s.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <div className="card" style={{ flex: 1 }}>
        <h3>📉 Top Losers</h3>
        {losers.map(s => (
          <div key={s.symbol}>
            {s.symbol} — <span style={{ color: "#ff5252" }}>
              {s.changePercent.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketMovers;
