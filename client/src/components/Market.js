import { useEffect, useRef, useState, useMemo } from "react";
import api from "../api/axios";
import Sparkline from "./Sparkline";

const Market = ({
  prices = {},
  onBuy,
  onSell,
  balance = 0,
  holdings = [],
  watchlist = [],
  setWatchlist,
  priceHistory = {}
}) => {

  const prevPricesRef = useRef({});
  const [flashMap, setFlashMap] = useState({});
  const [changeMap, setChangeMap] = useState({});
  const [search, setSearch] = useState("");
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  // ================= HOLDING QTY =================
  const getHoldingQty = (symbol) => {
    const h = holdings.find(x => x.symbol === symbol);
    return h ? h.quantity : 0;
  };

  // ================= PRICE MOVEMENT =================
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
        if (newPrice < oldPrice) flashes[symbol] = "down";
      } else {
        changes[symbol] = 0;
      }
    });

    setFlashMap(flashes);
    setChangeMap(changes);

    const timer = setTimeout(() => setFlashMap({}), 600);

    prevPricesRef.current = Object.fromEntries(
      Object.entries(prices).map(([s, v]) => [s, Number(v.price)])
    );

    return () => clearTimeout(timer);
  }, [prices]);

  // ================= WATCHLIST TOGGLE =================
  const toggleWatchlist = async (symbol) => {
    try {
      const res = await api.post("/api/watchlist/toggle", { symbol });
      setWatchlist(res.data);
    } catch {
      console.error("Watchlist update failed");
    }
  };

  // ================= SORT + FILTER =================
  const sortedMarket = useMemo(() => {
    let entries = Object.entries(prices);

    // search filter
    if (search.trim() !== "") {
      entries = entries.filter(([symbol]) =>
        symbol.toLowerCase().includes(search.toLowerCase())
      );
    }

    // watchlist only filter
    if (showWatchlistOnly) {
      entries = entries.filter(([symbol]) =>
        watchlist.includes(symbol)
      );
    }

    // sort by biggest movers
    return entries.sort((a, b) => {
      const changeA = Math.abs(changeMap[a[0]] || 0);
      const changeB = Math.abs(changeMap[b[0]] || 0);
      return changeB - changeA;
    });
  }, [prices, changeMap, search, showWatchlistOnly, watchlist]);

  // split sections
  const watchlistMarket = sortedMarket.filter(([s]) =>
    watchlist.includes(s)
  );

  const normalMarket = sortedMarket.filter(
    ([s]) => !watchlist.includes(s)
  );

  // ================= ROW RENDER =================
  const renderRow = ([symbol, stock]) => {
    const price = Number(stock?.price || 0);
    const ownedQty = getHoldingQty(symbol);
    const canBuy = balance >= price;

    const percent = changeMap[symbol] || 0;
    const isUp = percent >= 0;

    return (
      <div key={symbol} style={{ padding: "6px 0" }}>
        <span
          style={{ cursor: "pointer", marginRight: "6px" }}
          onClick={() => toggleWatchlist(symbol)}
        >
          {watchlist.includes(symbol) ? "⭐" : "☆"}
        </span>

        <strong>{symbol}</strong>

        <span
          className={
            flashMap[symbol] === "up"
              ? "price-up"
              : flashMap[symbol] === "down"
              ? "price-down"
              : ""
          }
          style={{ padding: "2px 6px", borderRadius: "4px", marginLeft: "6px" }}
        >
          ₹{price.toFixed(2)}
        </span>

        <span
          style={{
            marginLeft: "10px",
            color: isUp ? "#00c853" : "#ff5252",
            fontWeight: "bold"
          }}
        >
          {isUp ? "↑" : "↓"} {percent.toFixed(2)}%
        </span>

        <Sparkline data={priceHistory[symbol] || []} />

        <br />

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

        <hr />
      </div>
    );
  };

  // ================= GUARD =================
  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading market data...</p>;
  }

  // ================= UI =================
  return (
    <div>
      <h3>Market</h3>

      <div style={{ marginBottom: "10px" }}>
        <input
          placeholder="Search symbol (AAPL, TSLA...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <button onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}>
          {showWatchlistOnly ? "Show All" : "Watchlist Only"}
        </button>
      </div>

      {/* ⭐ WATCHLIST */}
      {watchlistMarket.length > 0 && (
        <>
          <h4 style={{ color: "#60a5fa" }}>⭐ Watchlist</h4>
          {watchlistMarket.map(renderRow)}
        </>
      )}

      {/* 🔥 MARKET MOVERS */}
      <h4 style={{ color: "#facc15" }}>🔥 Market Movers</h4>
      {normalMarket.map(renderRow)}
    </div>
  );
};

export default Market;
