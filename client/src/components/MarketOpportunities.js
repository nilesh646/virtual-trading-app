import { useMemo } from "react";

const MarketOpportunities = ({
  prices = {},
  momentumScore = {},
  sectorStrength = []
}) => {

  const opportunities = useMemo(() => {
    const list = [];

    Object.entries(prices).forEach(([symbol, stock]) => {
      const change = Number(stock?.changePercent || 0);
      const momentum = momentumScore[symbol] || 0;

      // ⭐ Breakout
      if (momentum > 80 && change > 1) {
        list.push({
          symbol,
          type: "breakout",
          text: `🔥 Breakout: ${symbol} (${change.toFixed(2)}%)`
        });
      }

      // 🚀 Momentum continuation
      else if (momentum > 65 && change > 0.5) {
        list.push({
          symbol,
          type: "momentum",
          text: `⭐ Momentum: ${symbol} (Score ${momentum})`
        });
      }

      // ⚠ Weakness
      else if (momentum < 35 && change < -0.5) {
        list.push({
          symbol,
          type: "weak",
          text: `⚠ Weak: ${symbol} (${change.toFixed(2)}%)`
        });
      }

      // ❄ Cooling
      else if (momentum < 30) {
        list.push({
          symbol,
          type: "cooling",
          text: `❄ Cooling: ${symbol}`
        });
      }
    });

    return list.slice(0, 6); // show top 6 only
  }, [prices, momentumScore]);

  if (!opportunities.length) return null;

  return (
    <div className="card">
      <h3>🤖 AI Opportunities</h3>

      {opportunities.map((op, i) => (
        <div key={i} style={{ padding: "6px 0" }}>
          {op.text}
        </div>
      ))}
    </div>
  );
};

export default MarketOpportunities;
