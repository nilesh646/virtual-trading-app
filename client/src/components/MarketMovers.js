import { useMemo } from "react";
import COLORS from "../styles/colors";

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
      <h3>📊 Market Movers</h3>

      <div style={{ display: "flex", gap: "40px" }}>
        
        {/* 🔥 Gainers */}
        <div>
          <h4 style={{ color: COLORS.green }}>🔥 Top Gainers</h4>

          {movers.gainers.map((s) => (
            <div key={s.symbol}>
              <strong>{s.symbol}</strong>

              <span
                style={{
                  marginLeft: "8px",
                  color: COLORS.green,
                  fontWeight: "bold"
                }}
              >
                +{s.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>

        {/* 🔻 Losers */}
        <div>
          <h4 style={{ color: COLORS.red }}>🔻 Top Losers</h4>

          {movers.losers.map((s) => (
            <div key={s.symbol}>
              <strong>{s.symbol}</strong>

              <span
                style={{
                  marginLeft: "8px",
                  color: COLORS.red,
                  fontWeight: "bold"
                }}
              >
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