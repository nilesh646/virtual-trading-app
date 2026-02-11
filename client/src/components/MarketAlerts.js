import { useMemo } from "react";
import { SECTOR_MAP } from "../data/sectors";

const MarketAlerts = ({
  prices = {},
  changeMap = {},
  momentumScore = {},
  sectorStrength = []
}) => {

  const strongestSector =
    sectorStrength.length > 0 ? sectorStrength[0][0] : null;

  const alerts = useMemo(() => {
    const list = [];

    Object.entries(prices).forEach(([symbol, stock]) => {
      const change = Number(changeMap[symbol] || 0);
      const momentum = Number(momentumScore[symbol] || 50);
      const sector = SECTOR_MAP[symbol] || "Others";

      // ================= BREAKOUT =================
      if (momentum > 75 && change > 1) {
        list.push({
          priority: 1,
          text: `🔥 ${symbol} strong breakout (Momentum ${momentum})`,
          color: "#00c853"
        });
      }

      // ================= SECTOR MOMENTUM =================
      else if (
        sector === strongestSector &&
        momentum > 65 &&
        change > 0.5
      ) {
        list.push({
          priority: 2,
          text: `⚡ ${symbol} rising with strong ${sector} sector`,
          color: "#ffb300"
        });
      }

      // ================= WEAKENING =================
      else if (momentum < 40 && change < -0.5) {
        list.push({
          priority: 3,
          text: `⚠ ${symbol} weakening trend`,
          color: "#ff5252"
        });
      }

      // ================= HIGH VOLATILITY =================
      else if (Math.abs(change) > 1.5) {
        list.push({
          priority: 4,
          text: `📉 ${symbol} high volatility (${change.toFixed(2)}%)`,
          color: "#ffa726"
        });
      }
    });

    // sort by priority
    return list
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6);

  }, [prices, changeMap, momentumScore,  strongestSector]);

  if (!alerts.length) return null;

  return (
    <div className="card" style={{ marginBottom: "15px" }}>
      <h4>🚨 Smart Market Alerts</h4>

      {alerts.map((a, i) => (
        <div
          key={i}
          style={{
            padding: "6px 0",
            fontWeight: "bold",
            color: a.color
          }}
        >
          {a.text}
        </div>
      ))}
    </div>
  );
};

export default MarketAlerts;
