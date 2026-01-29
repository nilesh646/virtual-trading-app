import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Trade = ({ refreshWallet }) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
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
        quantity,
        notes,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean)
      });

      toast.success("Stock sold successfully!");

      await refreshWallet();

      // Reset form
      setSymbol("");
      setQuantity(1);
      setNotes("");
      setTags("");

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

      {/* 📝 Notes */}
      <textarea
        placeholder="Trade notes (why you sold)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ marginTop: "6px", width: "100%" }}
      />

      {/* 🏷 Tags */}
      <input
        type="text"
        placeholder="Tags (breakout, news, scalp)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        style={{ marginTop: "6px", width: "100%" }}
      />

      <button
        onClick={sellStock}
        disabled={loading || !symbol || quantity <= 0}
        style={{ marginTop: "8px" }}
      >
        {loading ? "Processing..." : "Sell"}
      </button>
    </div>
  );
};

export default Trade;
