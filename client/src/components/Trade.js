import { useState } from "react";
import api from "../api/axios";
import COLORS from "../styles/colors";

const Trade = ({ refreshWallet }) => {

  // ✅ Hooks MUST be inside component
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState("MARKET");
  const [limitPrice, setLimitPrice] = useState("");

  const handleBuy = async () => {
    try {
      if (!symbol) {
        alert("Enter symbol");
        return;
      }

      if (orderType === "LIMIT" && !limitPrice) {
        alert("Enter limit price");
        return;
      }

      await api.post("/api/trade/buy", {
        symbol,
        quantity,
        orderType,
        limitPrice: orderType === "LIMIT" ? Number(limitPrice) : null
      });

      // await api.post("/api/trade/sell", {
      //   symbol,
      //   quantity,
      //   notes: noteInputs[symbol],
      //   tags: tagInputs[symbol]?.split(",") || [],
      //   emotion: emotionInputs[symbol],
      //   rating: Number(ratingInputs[symbol]) || 0
      // });

      refreshWallet();

    } catch (err) {
      console.error(err);
      alert("Buy failed");
    }
  };

  return (
    <div>
      <h3>Trade</h3>

      <input
        placeholder="Symbol"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
      />

      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      {/* ORDER TYPE */}
      <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
        <option value="MARKET">Market</option>
        <option value="LIMIT">Limit</option>
      </select>

      {/* LIMIT PRICE */}
      {orderType === "LIMIT" && (
        <input
          type="number"
          placeholder="Limit price"
          value={limitPrice}
          onChange={(e) => setLimitPrice(e.target.value)}
        />
      )}

      <button onClick={handleBuy}>Buy</button>

      <button
        style={{
          background: COLORS.blue,
          color: "#fff",
          border: "none",
          padding: "8px 12px",
          borderRadius: "6px"
        }}
      >
        Buy
      </button>

    </div>
  );
};

export default Trade;