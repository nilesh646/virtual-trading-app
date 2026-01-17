import api from "../api/axios";
import toast from "react-hot-toast";

const Portfolio = ({ holdings = [], prices = {}, refresh }) => {
  if (!holdings.length) return <p>No holdings</p>;

  return (
    <div>
      <h3>Portfolio</h3>

      {holdings.map(h => (
        <div key={h.symbol}>
          <strong>{h.symbol}</strong><br />
          Qty: {h.quantity}<br />
          Avg Price: ₹{h.avgPrice}<br />
          Current Price: ₹{prices[h.symbol] ?? h.avgPrice}<br />

          <button
            onClick={async () => {
              try {
                await api.post("/api/trade/sell", {
                  symbol: h.symbol,
                  quantity: 1
                });
                toast.success(`Sold 1 ${h.symbol}`);
                refresh();
              } catch (err) {
                toast.error(err.response?.data?.error || "Sell failed");
              }
            }}
          >
            Sell 1
          </button>
          <button
            onClick={() =>
              api.post("/api/trade/sell", { symbol: h.symbol, quantity: 1 })
                .then(refreshWallet)
            }
          >
            Sell 1
          </button>

          <button
            disabled={h.quantity === 0}
            onClick={() =>
              api.post("/api/trade/sell", { symbol: h.symbol, quantity: 1 })
                .then(refreshWallet)
            }
          >
            Sell 1
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
};

export default Portfolio;

