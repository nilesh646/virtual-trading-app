import React from "react";

const MarketHeatmap = ({ prices = {}, onBuy }) => {
  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading heatmap...</p>;
  }

  const entries = Object.entries(prices);

  const getColor = (change) => {
    if (change > 1.5) return "#00c853";
    if (change > 0.5) return "#4caf50";
    if (change > 0) return "#81c784";
    if (change > -0.5) return "#ef9a9a";
    if (change > -1.5) return "#ef5350";
    return "#d50000";
  };

  return (
    <div>
      <h3>Market Heatmap</h3>

      <div className="heatmap-grid">
        {entries.map(([symbol, stock]) => {
          const price = Number(stock.price || 0);
          const change = Number(stock.changePercent || 0);

          const size = Math.min(
            120,
            60 + Math.abs(change) * 30
          );

          return (
            <div
              key={symbol}
              className="heatmap-cell"
              style={{
                background: getColor(change),
                width: size,
                height: size
              }}
              onClick={() => onBuy(symbol)}
            >
              <strong>{symbol}</strong>
              <div>₹{price.toFixed(2)}</div>
              <div>{change.toFixed(2)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketHeatmap;
