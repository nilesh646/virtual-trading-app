import { useMemo } from "react";

const MarketMovers = ({ prices = {} }) => {

  const movers = useMemo(() => {
    const list = Object.entries(prices).map(([symbol, stock]) => ({
      symbol,
      change: Number(stock?.changePercent || 0)
    }));

    const gainers = [...list]
      .sort((a, b) => b.change - a.change)
      .slice(0, 5);

    const losers = [...list]
      .sort((a, b) => a.change - b.change)
      .slice(0, 5);

    return { gainers, losers };
  }, [prices]);

  if (!prices || Object.keys(prices).length === 0)
    return <p>Loading movers...</p>;

  return (
    <div>
      <h3>Market Movers</h3>

      <div style={{ display: "flex", gap: "40px" }}>
        {/* Gainers */}
        <div>
          <h4 style={{ color: "#00c853" }}>🔥 Top Gainers</h4>
          {movers.gainers.map((s) => (
            <div key={s.symbol}>
              {s.symbol}{" "}
              <span style={{ color: "#00c853" }}>
                +{s.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* Losers */}
        <div>
          <h4 style={{ color: "#ff5252" }}>🔻 Top Losers</h4>
          {movers.losers.map((s) => (
            <div key={s.symbol}>
              {s.symbol}{" "}
              <span style={{ color: "#ff5252" }}>
                {s.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketMovers;
