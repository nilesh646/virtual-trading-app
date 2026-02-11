import React, { useMemo, useState, useEffect } from "react";
import { SECTOR_MAP } from "../data/sectors";

const MarketHeatmap = ({ prices = {}, onBuy }) => {
  /* ================= STATE ================= */
  const [sectorView, setSectorView] = useState(false);
  const [autoSectorMode, setAutoSectorMode] = useState(true);
  const [activeSector, setActiveSector] = useState(null);

  /* =====================================================
     GUARD (NO HOOKS AFTER THIS)
  ===================================================== */
  const hasPrices = prices && Object.keys(prices).length > 0;

  /* =====================================================
     GROUP STOCKS BY SECTOR
  ===================================================== */
  const sectorData = useMemo(() => {
    if (!hasPrices) return {};

    const grouped = {};
    Object.entries(prices).forEach(([symbol, stock]) => {
      const sector = SECTOR_MAP[symbol] || "Others";
      if (!grouped[sector]) grouped[sector] = [];
      grouped[sector].push([symbol, stock]);
    });
    return grouped;
  }, [prices, hasPrices]);

  /* =====================================================
     SECTOR STRENGTH
  ===================================================== */
  const sectorStrength = useMemo(() => {
    const strength = {};

    Object.entries(sectorData).forEach(([sector, stocks]) => {
      const avg =
        stocks.reduce(
          (sum, [, stock]) => sum + Number(stock.changePercent || 0),
          0
        ) / stocks.length;

      strength[sector] = avg;
    });

    return Object.entries(strength).sort((a, b) => b[1] - a[1]);
  }, [sectorData]);

  /* =====================================================
     STRONGEST SECTOR
  ===================================================== */
  const strongestSector = useMemo(() => {
    return sectorStrength.length ? sectorStrength[0][0] : null;
  }, [sectorStrength]);

  /* =====================================================
     AUTO SECTOR MODE (Week 14–15)
  ===================================================== */
  useEffect(() => {
    if (!autoSectorMode) return;

    if (sectorStrength.length) {
      const [sector, strength] = sectorStrength[0];
      setActiveSector(strength > 0.5 ? sector : null);
    }
  }, [sectorStrength, autoSectorMode]);

  /* =====================================================
     MOMENTUM SCORE (0–100)
  ===================================================== */
  const momentumScore = useMemo(() => {
    const scores = {};

    Object.entries(sectorData).forEach(([sector, stocks]) => {
      const sectorAvg =
        sectorStrength.find(s => s[0] === sector)?.[1] || 0;

      stocks.forEach(([symbol, stock]) => {
        const change = Number(stock.changePercent || 0);
        const stockScore = Math.min(100, Math.max(0, change * 20 + 50));
        const sectorScore = Math.min(100, Math.max(0, sectorAvg * 20 + 50));
        scores[symbol] = Math.round(stockScore * 0.6 + sectorScore * 0.4);
      });
    });

    return scores;
  }, [sectorData, sectorStrength]);

  /* =====================================================
     SIGNAL MAP
  ===================================================== */
  const signalMap = useMemo(() => {
    const map = {};
    Object.entries(prices).forEach(([symbol, stock]) => {
      const change = Number(stock.changePercent || 0);
      const m = momentumScore[symbol] || 0;

      if (m > 80 && change > 1) map[symbol] = "breakout";
      else if (m > 60 && change > 0.5) map[symbol] = "momentum";
      else if (m < 40 && change < -0.5) map[symbol] = "weak";
      else if (m < 30) map[symbol] = "cooling";
    });
    return map;
  }, [prices, momentumScore]);

  /* =====================================================
     TOP MOVERS (USED)
  ===================================================== */
  const topMovers = useMemo(() => {
    return Object.entries(prices)
      .sort(
        (a, b) =>
          Math.abs(b[1].changePercent || 0) -
          Math.abs(a[1].changePercent || 0)
      )
      .slice(0, 5)
      .map(([s]) => s);
  }, [prices]);

  /* =====================================================
     COLOR HELPER
  ===================================================== */
  const getColor = (c) => {
    if (c > 1.5) return "#00c853";
    if (c > 0.5) return "#4caf50";
    if (c > 0) return "#81c784";
    if (c > -0.5) return "#ef9a9a";
    if (c > -1.5) return "#ef5350";
    return "#d50000";
  };

  /* =====================================================
     CELL RENDER
  ===================================================== */
  const renderCell = (symbol, stock) => {
    const price = Number(stock.price || 0);
    const change = Number(stock.changePercent || 0);
    const size = Math.min(120, 60 + Math.abs(change) * 30);

    return (
      <div
        key={symbol}
        className={`heatmap-cell ${topMovers.includes(symbol) ? "top-mover" : ""}`}
        style={{
          background: getColor(change),
          width: size,
          height: size
        }}
        onClick={() => onBuy(symbol)}
      >
        <strong>{symbol}</strong>

        {signalMap[symbol] && (
          <div className={`badge ${signalMap[symbol]}`}>
            {signalMap[symbol]}
          </div>
        )}

        <div>₹{price.toFixed(2)}</div>
        <div>{change.toFixed(2)}%</div>
        <div style={{ fontSize: 12 }}>M: {momentumScore[symbol]}</div>
      </div>
    );
  };

  /* =====================================================
     FINAL GUARD
  ===================================================== */
  if (!hasPrices) return <p>Loading heatmap...</p>;

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

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setSectorView(!sectorView)}>
          {sectorView ? "Show All Market" : "Sector View"}
        </button>

        <button onClick={() => setAutoSectorMode(!autoSectorMode)}>
          {autoSectorMode ? "Auto Sector ON" : "Auto Sector OFF"}
        </button>
      </div>

      {!sectorView && (
        <div className="heatmap-grid">
          {Object.entries(prices)
            .filter(([s]) =>
              !activeSector
                ? true
                : (SECTOR_MAP[s] || "Others") === activeSector
            )
            .map(([s, st]) => renderCell(s, st))}
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
              {stocks.map(([s, st]) => renderCell(s, st))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default MarketHeatmap;
