// REMOVE useState if not used
import React from "react";


const Market = ({ prices, onBuy, balance }) => {
  return (
    <div>
      <h3>Market</h3>

      {Object.keys(prices).length === 0 && <p>Loading prices...</p>}

      {Object.entries(prices).map(([symbol, price]) => {
        const canBuy = balance >= price;

        return (
          <div key={symbol}>
            <strong>{symbol}</strong> – ₹{price}
            <br />
            <button
              disabled={!canBuy}
              onClick={() => onBuy(symbol)}
            >
              {canBuy ? "Buy 1" : "Insufficient Balance"}
            </button>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default Market;
