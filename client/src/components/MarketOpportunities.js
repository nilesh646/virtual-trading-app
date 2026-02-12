import { useMemo } from "react";
import { SECTOR_MAP } from "../data/sectors";


const MarketOpportunities = ({
  prices = {},
  changeMap = {},
  tradeScore = {},
  sectorStrength = {}
}) => {

  const opportunities = useMemo(() => {
    const list = [];

    Object.entries(prices).forEach(([symbol, stock]) => {
      const change = changeMap[symbol] || 0;
      const momentum = tradeScore[symbol] || 50;

      const sector = SECTOR_MAP[symbol] || "Others";

      const sectorValue =
        typeof sectorStrength === "object"
          ? sectorStrength[sector] || 0
          : 0;


      /* ================= SCORE ================= */
      const finalScore =
        momentum * 0.5 +
        Math.abs(change) * 15 +
        sectorValue * 20;

      /* ================= REASONS ================= */
      const reasons = [];

      if (change > 1) reasons.push("🔥 Breakout Move");
      if (momentum > 70) reasons.push("🚀 Strong Momentum");
      if (sectorValue > 0.5) reasons.push("🏭 Strong Sector");
      if (change > 0.3 && change < 1)
        reasons.push("📈 Early Momentum");

      /* ================= CONFIDENCE ENGINE ================= */
      let confidenceScore = 0;

      if (momentum > 70) confidenceScore += 40;
      if (sectorValue > 0.5) confidenceScore += 30;
      if (change > 0.7) confidenceScore += 30;

      let confidenceLabel = "LOW";
      let confidenceColor = "#ff5252";

      if (confidenceScore >= 70) {
        confidenceLabel = "HIGH";
        confidenceColor = "#00c853";
      } else if (confidenceScore >= 40) {
        confidenceLabel = "MEDIUM";
        confidenceColor = "#ffb300";
      }

      if (finalScore > 40) {
        list.push({
          symbol,
          score: Math.round(finalScore),
          change,
          reasons,
          confidenceScore,
          confidenceLabel,
          confidenceColor
        });
      }
    });

    return list
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

  }, [prices, changeMap, tradeScore, sectorStrength]);

  if (!opportunities.length)
    return <p>Scanning opportunities...</p>;

  return (
    <div>
      <h3>⭐ Best Opportunities Today</h3>

      {opportunities.map(stock => (
        <div
          key={stock.symbol}
          style={{
            padding: "10px 0",
            borderBottom: "1px solid #1f2937"
          }}
        >
          <strong>{stock.symbol}</strong>

          <span
            style={{
              marginLeft: "10px",
              color: "#60a5fa",
              fontWeight: "bold"
            }}
          >
            Score: {stock.score}
          </span>

          <span
            style={{
              marginLeft: "10px",
              color: stock.change >= 0 ? "#00c853" : "#ff5252"
            }}
          >
            {stock.change >= 0 ? "↑" : "↓"}{" "}
            {stock.change.toFixed(2)}%
          </span>

          {/* 🔒 CONFIDENCE */}
          <span
            style={{
              marginLeft: "10px",
              fontWeight: "bold",
              color: stock.confidenceColor
            }}
          >
            Confidence: {stock.confidenceLabel}
          </span>

          {/* ✅ REASONS */}
          <div style={{ fontSize: "12px", marginTop: "6px" }}>
            {stock.reasons.map((r, i) => (
              <div key={i}>{r}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketOpportunities;
