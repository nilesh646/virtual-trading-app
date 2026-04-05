import { useEffect, useRef, useState, useMemo } from "react";
import api from "../api/axios";
import PriceChart from "./PriceChart";
import COLORS from "../styles/colors";

const Market = ({
  prices = {},
  onBuy,
  onSell,
  balance = 0,
  holdings = [],
  watchlist = [],
  setWatchlist,
  priceHistory = {},
  tradeScore = {},
  opportunityMap = {}
}) => {

  const prevPricesRef = useRef({});
  const [flashMap, setFlashMap] = useState({});
  const [changeMap, setChangeMap] = useState({});
  const [search, setSearch] = useState("");
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  const getHoldingQty = (symbol) => {
    const h = holdings.find(x => x.symbol === symbol);
    return h ? h.quantity : 0;
  };

  /* ================= SIGNAL ================= */
  const getSignal = (symbol, percent) => {
    const score = tradeScore[symbol] || 50;

    if (score >= 75 && percent > 0.3)
      return { label: "🟢 Strong Buy", color: COLORS.green };

    if (score >= 60)
      return { label: "🟡 Watch", color: COLORS.yellow };

    if (score < 40)
      return { label: "🔴 Avoid", color: COLORS.red };

    return null;
  };

  /* ================= RISK (FIXED & USED) ================= */
  const getRisk = (percent) => {
    if (percent < -1)
      return { label: "⚠ HIGH RISK", color: COLORS.red };

    if (Math.abs(percent) > 1.5)
      return { label: "⚡ VOLATILE", color: COLORS.yellow };

    return null;
  };

  /* ================= PRICE MOVEMENT ================= */
  useEffect(() => {
    const flashes = {};
    const changes = {};

    Object.entries(prices).forEach(([symbol, stock]) => {
      const newPrice = Number(stock?.price || 0);
      const oldPrice = prevPricesRef.current[symbol];

      if (oldPrice !== undefined && oldPrice !== 0) {
        const percent = ((newPrice - oldPrice) / oldPrice) * 100;
        changes[symbol] = percent;

        if (newPrice > oldPrice) flashes[symbol] = "up";
        else if (newPrice < oldPrice) flashes[symbol] = "down";
      } else {
        changes[symbol] = 0;
      }
    });

    setFlashMap(flashes);
    setChangeMap(changes);

    const timer = setTimeout(() => setFlashMap({}), 500);

    prevPricesRef.current = Object.fromEntries(
      Object.entries(prices).map(([s, v]) => [s, Number(v.price)])
    );

    return () => clearTimeout(timer);
  }, [prices]);

  /* ================= WATCHLIST ================= */
  const toggleWatchlist = async (symbol) => {
    try {
      const res = await api.post("/api/watchlist/toggle", { symbol });
      setWatchlist(res.data);
    } catch {
      console.error("Watchlist update failed");
    }
  };

  /* ================= SORT ================= */
  const sortedMarket = useMemo(() => {
    let entries = Object.entries(prices);

    if (search.trim()) {
      entries = entries.filter(([symbol]) =>
        symbol.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (showWatchlistOnly) {
      entries = entries.filter(([symbol]) =>
        watchlist.includes(symbol)
      );
    }

    return entries.sort((a, b) => {
      const aiA = opportunityMap[a[0]];
      const aiB = opportunityMap[b[0]];

      if (aiA?.confidence === "HIGH" && aiB?.confidence !== "HIGH") return -1;
      if (aiB?.confidence === "HIGH" && aiA?.confidence !== "HIGH") return 1;

      const changeA = Math.abs(changeMap[a[0]] || 0);
      const changeB = Math.abs(changeMap[b[0]] || 0);

      return changeB - changeA;
    });
  }, [prices, changeMap, search, showWatchlistOnly, watchlist, opportunityMap]);

  const watchlistMarket = sortedMarket.filter(([s]) =>
    watchlist.includes(s)
  );

  const normalMarket = sortedMarket.filter(
    ([s]) => !watchlist.includes(s)
  );

  /* ================= ROW ================= */
  const renderRow = ([symbol, stock]) => {
    const price = Number(stock?.price || 0);
    const ownedQty = getHoldingQty(symbol);
    const canBuy = balance >= price;

    const percent = changeMap[symbol] || 0;
    const isUp = percent >= 0;

    const signal = getSignal(symbol, percent);
    const risk = getRisk(percent);
    const opportunity = opportunityMap[symbol];

    return (
      <div
        key={symbol}
        style={{
          padding: "8px 0",
          borderBottom: "1px solid #1f2937"
        }}
      >
        {/* ⭐ WATCHLIST */}
        <span
          style={{ cursor: "pointer", marginRight: "6px" }}
          onClick={() => toggleWatchlist(symbol)}
        >
          {watchlist.includes(symbol) ? "⭐" : "☆"}
        </span>

        <strong>{symbol}</strong>

        {/* SCORE */}
        <span className="badge badge-blue">
          Score: {tradeScore[symbol] || 0}
        </span>

        {/* OPPORTUNITY */}
        {opportunity && (
          <span className="badge badge-green">
            🔥 {opportunity.type?.toUpperCase()}
          </span>
        )}

        {/* RISK */}
        {risk && (
          <span
            className={`badge ${
              risk.label.includes("HIGH") ? "badge-red" : "badge-yellow"
            }`}
          >
            {risk.label}
          </span>
        )}

        {/* PRICE */}
        <span style={{ marginLeft: "6px" }}>
          ₹{price.toFixed(2)}
        </span>

        {/* CHANGE */}
        <span
          style={{
            marginLeft: "10px",
            color: isUp ? COLORS.green : COLORS.red,
            fontWeight: "bold"
          }}
        >
          {isUp ? "↑" : "↓"} {percent.toFixed(2)}%
        </span>

        {/* SIGNAL */}
        {signal && (
          <span
            className={`badge ${
              signal.label.includes("Strong")
                ? "badge-green"
                : signal.label.includes("Watch")
                ? "badge-yellow"
                : "badge-red"
            }`}
          >
            {signal.label}
          </span>
        )}

        {/* HOLDINGS */}
        {ownedQty > 0 && (
          <span style={{ marginLeft: "10px", color: "#60a5fa" }}>
            Qty: {ownedQty}
          </span>
        )}

        {/* CHART */}
        <div style={{ marginTop: "4px" }}>
          <PriceChart data={priceHistory[symbol] || []} />
        </div>

        {/* BUTTONS */}
        <button disabled={!canBuy} onClick={() => onBuy(symbol)}>
          Buy 1
        </button>

        <button
          disabled={ownedQty < 1}
          onClick={() => onSell(symbol)}
          style={{ marginLeft: "8px" }}
        >
          Sell 1
        </button>
      </div>
    );
  };

  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading market data...</p>;
  }

  return (
    <div>
      <h3>Market</h3>

      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="Search symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}>
          {showWatchlistOnly ? "Show All" : "Watchlist Only"}
        </button>
      </div>

      {watchlistMarket.length > 0 && (
        <>
          <h4>⭐ Watchlist</h4>
          {watchlistMarket.map(renderRow)}
        </>
      )}

      <h4>🔥 Market Movers</h4>
      {normalMarket.map(renderRow)}
    </div>
  );
};

export default Market;