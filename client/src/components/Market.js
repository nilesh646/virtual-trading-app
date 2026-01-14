import { useEffect, useState } from "react";
import api from "../api/axios";

const Market = ({ prices, onBuy }) => {
  return (
    <div>
      <h3>Market</h3>

      {Object.keys(prices).map(symbol => (
        <div key={symbol}>
          {symbol} - ₹{prices[symbol]}
          <button onClick={() => onBuy(symbol)}>Buy</button>
        </div>
      ))}
    </div>
  );
};

export default Market;
