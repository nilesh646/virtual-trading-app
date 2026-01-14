import { useState } from "react";

const Market = ({ prices, onBuy }) => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <h3>Market</h3>

      {Object.keys(prices).map(symbol => (
        <div key={symbol}>
          {symbol} - ₹{prices[symbol]}
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onBuy(symbol);
              setLoading(false);
            }}
          >
            {loading ? "Processing..." : "Buy"}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Market;
