import { useEffect, useState } from "react";
import api from "../api/axios";

const Market = ({ onBuy }) => {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    api.get("/api/market").then(res => setStocks(res.data));
  }, []);

  return (
    <div className="card">
      <h3>Market</h3>
      {stocks.map(stock => (
        <div key={stock.symbol}>
          <span>{stock.symbol} - ₹{stock.price}</span>
          <button onClick={() => onBuy(stock.symbol)}>Buy</button>
        </div>
      ))}
    </div>
  );
};

export default Market;
