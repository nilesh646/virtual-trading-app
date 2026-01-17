import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Trade = ({ refreshWallet }) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const sellStock = async () => {
    if (!symbol) {
      toast.error("Please enter a stock symbol");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/trade/sell", {
        symbol,
        quantity
      });

      toast.success("Stock sold successfully!");

      // 🔥 Refresh wallet + portfolio
      await refreshWallet();

      // 🔥 Reset form
      setSymbol("");
      setQuantity(1);
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
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
      />

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button
        onClick={sellStock}
        disabled={loading || !symbol || quantity <= 0}
      >
        {loading ? "Processing..." : "Sell"}
      </button>
    </div>
  );
};

export default Trade;
