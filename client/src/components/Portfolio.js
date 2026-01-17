import api from "../api/axios";
import toast from "react-hot-toast";

const Portfolio = ({ holdings, prices, refreshWallet }) => {
  if (!holdings || holdings.length === 0) {
    return <p>No holdings</p>;
  }

  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading prices...</p>;
  }

  let totalPL = 0;

  const sellOne = async (symbol) => {
    try {
      await api.post("/api/trade/sell", { symbol, quantity: 1 });
      toast.success("Stock sold");
      refreshWallet();
    } catch (err) {
      toast.error(err.response?.data?.error || "Sell failed");
    }
  };

  return (
    <div>
      <h3>Portfolio</h3>

      {holdings.map((h) => {
        const currentPrice = prices[h.symbol];
        if (!currentPrice) return null;

        const invested = h.quantity * h.avgPrice;
        const current = h.quantity * currentPrice;
        const pl = current - invested;

        totalPL += pl;

        return (
          <div key={h.symbol}>
            <strong>{h.symbol}</strong><br />
            Qty: {h.quantity}<br />
            Avg Price: ₹{h.avgPrice}<br />
            Current Price: ₹{currentPrice}<br />

            <span style={{ color: pl >= 0 ? "green" : "red" }}>
              P/L: ₹{pl.toFixed(2)}
            </span>
            <br />

            <button
              disabled={h.quantity === 0}
              onClick={() => sellOne(h.symbol)}
            >
              Sell 1
            </button>

            <hr />
          </div>
        );
      })}

      <h4 style={{ color: totalPL >= 0 ? "green" : "red" }}>
        Total P/L: ₹{totalPL.toFixed(2)}
      </h4>
    </div>
  );
};

export default Portfolio;


