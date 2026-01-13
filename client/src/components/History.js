import { useEffect, useState } from "react";
import api from "../api/axios";

const History = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/api/history?page=${page}&limit=5`)
      .then(res => setData(res.data));
  }, [page]);

  if (!data) return <p>Loading history...</p>;

  return (
    <div>
      <h3>Order History</h3>

      <table>
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
          {data.trades.map((t, i) => (
            <tr key={i}>
              <td>{t.type}</td>
              <td>{t.symbol}</td>
              <td>{t.quantity}</td>
              <td>₹{t.price}</td>
              <td>{new Date(t.date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        disabled={page === 1}
        onClick={() => setPage(p => p - 1)}
      >
        Prev
      </button>

      <button
        disabled={page === data.totalPages}
        onClick={() => setPage(p => p + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default History;
