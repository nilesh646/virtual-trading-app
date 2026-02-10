import React, { useMemo, useState, useEffect } from "react";
import { SECTOR_MAP } from "../data/sectors";

const MarketHeatmap = ({ prices = {}, onBuy }) => {

  /* ================= STATE ================= */
  const [sectorView, setSectorView] = useState(false);
  const [autoSectorMode, setAutoSectorMode] = useState(true);
  const [activeSector, setActiveSector] = useState(null);

  /* =====================================================
     GROUP STOCKS BY SECTOR
  ===================================================== */
  const sectorData = useMemo(() => {
    const grouped = {};

    Object.entries(prices).forEach(([symbol, stock]) => {
      const sector = SECTOR_MAP[symbol] || "Others";

      if (!grouped[sector]) grouped[sector] = [];
      grouped[sector].push([symbol, stock]);
    });

    return grouped;
  }, [prices]);

  /* =====================================================
     CALCULATE SECTOR STRENGTH
  ===================================================== */
  const sectorStrength = useMemo(() => {
    const strength = {};

    Object.entries(sectorData).forEach(([sector, stocks]) => {
      let total = 0;
      let count = 0;

      stocks.forEach(([_, stock]) => {
        const change = Number(stock.changePercent || 0);
        total += change;
        count++;
      });

      strength[sector] = count ? total / count : 0;
    });

    return Object.entries(strength).sort((a, b) => b[1] - a[1]);
  }, [sectorData]);

  /* =====================================================
     STRONGEST SECTOR
  ===================================================== */
  const strongestSector = useMemo(() => {
    if (!sectorStrength.length) return null;
    return sectorStrength[0][0];
  }, [sectorStrength]);

  /* =====================================================
     AUTO SECTOR FOCUS (WEEK 14 DAY 7)
  ===================================================== */
  useEffect(() => {
    if (!autoSectorMode) return;

    if (sectorStrength.length > 0) {
      const [sector, strength] = sectorStrength[0];

      if (strength > 0.5) {
        setActiveSector(sector);
      } else {
        setActiveSector(null);
      }
    }
  }, [sectorStrength, autoSectorMode]);

  /* =====================================================
     MOMENTUM SCORE
  ===================================================== */
  const momentumScore = useMemo(() => {
    const scores = {};

    Object.entries(sectorData).forEach(([sector, stocks]) => {
      const sectorValue =
        sectorStrength.find(s => s[0] === sector)?.[1] || 0;

      stocks.forEach(([symbol, stock]) => {
        const change = Number(stock.changePercent || 0);

        const stockScore = Math.min(100, Math.max(0, change * 20 + 50));
        const sectorScore = Math.min(100, Math.max(0, sectorValue * 20 + 50));

        scores[symbol] = Math.round(
          stockScore * 0.6 + sectorScore * 0.4
        );
      });
    });

    return scores;
  }, [sectorData, sectorStrength]);

  /* =====================================================
     SIGNAL MAP
  ===================================================== */
  const signalMap = useMemo(() => {
    const signals = {};

    Object.entries(prices).forEach(([symbol, stock]) => {
      const change = Number(stock.changePercent || 0);
      const momentum = momentumScore[symbol] || 0;

      if (momentum > 80 && change > 1) {
        signals[symbol] = "breakout";
      } else if (momentum > 60 && change > 0.5) {
        signals[symbol] = "momentum";
      } else if (momentum < 40 && change < -0.5) {
        signals[symbol] = "weak";
      } else if (momentum < 30) {
        signals[symbol] = "cooling";
      }
    });

    return signals;
  }, [prices, momentumScore]);

  /* =====================================================
     TOP MOVERS
  ===================================================== */
  const topMovers = useMemo(() => {
    return Object.entries(prices)
      .sort((a, b) =>
        Math.abs(b[1].changePercent || 0) -
        Math.abs(a[1].changePercent || 0)
      )
      .slice(0, 5)
      .map(([symbol]) => symbol);
  }, [prices]);

  /* =====================================================
     GUARD
  ===================================================== */
  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading heatmap...</p>;
  }

  /* =====================================================
     COLOR HELPERS
  ===================================================== */
  const getColor = (change) => {
    if (change > 1.5) return "#00c853";
    if (change > 0.5) return "#4caf50";
    if (change > 0) return "#81c784";
    if (change > -0.5) return "#ef9a9a";
    if (change > -1.5) return "#ef5350";
    return "#d50000";
  };

  /* =====================================================
     HEATMAP CELL
  ===================================================== */
  const renderCell = (symbol, stock) => {
    const price = Number(stock.price || 0);
    const change = Number(stock.changePercent || 0);

    const size = Math.min(120, 60 + Math.abs(change) * 30);

    return (
      <div
        key={symbol}
        className={`heatmap-cell ${
          topMovers.includes(symbol) ? "top-mover" : ""
        }`}
        style={{
          background: getColor(change),
          width: size,
          height: size,
          cursor: "pointer"
        }}
        onClick={() => onBuy(symbol)}
      >

        <strong>{symbol}</strong>

        {signalMap[symbol] === "breakout" && (
          <div className="badge breakout">🔥 Breakout</div>
        )}

        <div>₹{price.toFixed(2)}</div>
        <div>{change.toFixed(2)}%</div>

        <div style={{ fontSize: 12 }}>
          M: {momentumScore[symbol]}
        </div>
      </div>
    );
  };

  /* =====================================================
     UI
  ===================================================== */
  return (
    <div>
      <h3>Market Heatmap</h3>

      {activeSector && (
        <div className="strong-sector">
          🔥 Strongest Sector: {activeSector}
        </div>
      )}

      <button onClick={() => setSectorView(!sectorView)}>
        {sectorView ? "Show All Market" : "Sector View"}
      </button>

      <button onClick={() => setAutoSectorMode(!autoSectorMode)}>
        {autoSectorMode ? "Auto Sector ON" : "Auto Sector OFF"}
      </button>

      {!sectorView && (
        <div className="heatmap-grid">
          {Object.entries(prices)
            .filter(([symbol]) => {
              if (!activeSector) return true;
              return (
                (SECTOR_MAP[symbol] || "Others") === activeSector
              );
            })
            .map(([symbol, stock]) =>
              renderCell(symbol, stock)
            )}
        </div>
      )}

      {sectorView &&
        Object.entries(sectorData).map(([sector, stocks]) => (
          <div key={sector} style={{ marginTop: 20 }}>
            <h4>
              {sector}
              {sector === strongestSector && " 🔥"}
            </h4>

            <div className="heatmap-grid">
              {stocks.map(([symbol, stock]) =>
                renderCell(symbol, stock)
              )}
            </div>
          </div>
        ))}
    </div>
  );
};

export default MarketHeatmap;
