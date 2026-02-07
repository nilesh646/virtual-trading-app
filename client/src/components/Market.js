import { useEffect, useRef, useState, useMemo } from "react";
import api from "../api/axios";

const Market = ({
  prices = {},
  onBuy,
  onSell,
  balance = 0,
  holdings = [],
  watchlist = [],
  setWatchlist
}) => {

  const prevPricesRef = useRef({});
  const [flashMap, setFlashMap] = useState({});
  const [changeMap, setChangeMap] = useState({});

  // ================= HOLDING QTY =================
  const getHoldingQty = (symbol) => {
    const h = holdings.find(x => x.symbol === symbol);
    return h ? h.quantity : 0;
  };

  // ================= PRICE MOVEMENT DETECTION =================
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
      Object.entries(prices).map(([s, v]) => [
        s,
        Number(v.price)
      ])
    );

    return () => clearTimeout(timer);
  }, [prices]);

  // ================= WATCHLIST TOGGLE =================
  const toggleWatchlist = async (symbol) => {
    try {
      const res = await api.post("/api/watchlist/toggle", { symbol });
      setWatchlist(res.data);
    } catch (err) {
      console.error("Watchlist update failed");
    }
  };

  // ================= SORTING =================
  // Priority:
  // 1️⃣ Watchlist stocks
  // 2️⃣ Biggest movers
  const sortedMarket = useMemo(() => {
    return Object.entries(prices).sort((a, b) => {

      const aFav = watchlist.includes(a[0]);
      const bFav = watchlist.includes(b[0]);

      // Watchlist first
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // Then biggest movers
      const changeA = Math.abs(changeMap[a[0]] || 0);
      const changeB = Math.abs(changeMap[b[0]] || 0);

      return changeB - changeA;
    });
  }, [prices, changeMap, watchlist]);

  // ================= GUARD =================
  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading market data...</p>;
  }

  // ================= UI =================
  return (
    <div>
      <h3>Market</h3>

      {sortedMarket.map(([symbol, stock]) => {
        const price = Number(stock?.price || 0);
        const ownedQty = getHoldingQty(symbol);
        const canBuy = balance >= price;

        const percent = changeMap[symbol] || 0;
        const isUp = percent >= 0;

        return (
          <div key={symbol} style={{ padding: "6px 0" }}>

            {/* ⭐ WATCHLIST STAR */}
            <span
              style={{
                cursor: "pointer",
                marginRight: "6px",
                fontSize: "16px"
              }}
              onClick={() => toggleWatchlist(symbol)}
            >
              {watchlist.includes(symbol) ? "⭐" : "☆"}
            </span>

            <strong>{symbol}</strong>{" "}

            <span
              className={
                flashMap[symbol] === "up"
                  ? "price-up"
                  : flashMap[symbol] === "down"
                  ? "price-down"
                  : ""
              }
              style={{ padding: "2px 6px", borderRadius: "4px" }}
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

            <br />

            <button
              disabled={!canBuy}
              onClick={() => onBuy(symbol)}
            >
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
      })}
    </div>
  );
};

export default Market;
