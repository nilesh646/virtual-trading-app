import { useEffect, useState } from "react";
import api from "../api/axios";

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/history")
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading trade history...</p>;

  if (!history.length) return <p>No trades yet</p>;

  return (
    <div>
      <h3>Trade History</h3>
      <table width="100%" border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Type</th>
            <th>Symbol</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((t, i) => (
            <tr key={i}>
              <td style={{ color: t.type === "BUY" ? "green" : "red" }}>
                {t.type}
              </td>
              <td>{t.symbol}</td>
              <td>{t.quantity}</td>
              <td>₹{t.price}</td>
              <td>{new Date(t.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
