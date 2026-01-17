import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Trade = ({ refreshWallet }) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const sellStock = async () => {
    try {
      setLoading(true);
      await api.post("/api/trade/sell", { symbol, quantity });
      toast.success("Stock sold!");
      refreshWallet();
    } catch (err) {
      toast.error(err.response?.data?.error || "Sell failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Sell Stock</h3>

      <input
        placeholder="Symbol (AAPL)"
        value={symbol}
        onChange={e => setSymbol(e.target.value.toUpperCase())}
      />

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={e => setQuantity(+e.target.value)}
      />

      <button onClick={sellStock} disabled={loading}>
        {loading ? "Processing..." : "Sell"}
      </button>
    </div>
  );
};

export default Trade;
