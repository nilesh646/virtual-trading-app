import { useEffect, useState } from "react";
import api from "../api/axios";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/api/history").then(res => setHistory(res.data));
  }, []);

  return (
    <div>
      <h3>Order History</h3>
      {history.length === 0 && <p>No trades yet</p>}
      {history.map((t, index) => (
        <div key={index}>
          {t.type} | {t.symbol} | Qty: {t.quantity} | ₹{t.price} | {new Date(t.date).toLocaleString()}
        </div>
      ))}
    </div>
  );
};

export default History;
