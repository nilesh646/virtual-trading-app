import { useState } from "react";
import api from "../api/axios";

const Trade = ({ refreshWallet }) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);

  const buy = async () => {
    await api.post("/api/trade/buy", { symbol, quantity });
    refreshWallet();
  };

  const sell = async () => {
  try {
    await api.post("/api/trade/sell", {
      symbol,
      quantity: Number(quantity)
    });
    toast.success("Sell successful");
    refreshWallet();
  } catch (err) {
    toast.error(err.response?.data?.error || "Sell failed");
  }
  };


  return (
    <div className="card">
      <h3>Trade</h3>
      <input placeholder="Symbol" onChange={e => setSymbol(e.target.value)} />
      <input type="number" value={quantity} onChange={e => setQuantity(+e.target.value)} />
      <button onClick={buy}>Buy</button>
      <button onClick={sell}>Sell</button>
    </div>
  );
};

export default Trade;
