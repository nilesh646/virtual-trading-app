const Portfolio = ({ holdings = [], prices }) => {
  if (!holdings.length) return <p>No holdings</p>;
  if (!prices) return <p>Loading prices...</p>;

  const rows = holdings.map(h => {
    const price = prices[h.symbol];
    if (!price) return null;

    const invested = h.quantity * h.avgPrice;
    const current = h.quantity * price;
    const pl = current - invested;

    return { ...h, price, pl };
  }).filter(Boolean);

  const totalPL = rows.reduce((sum, r) => sum + r.pl, 0);

  return (
    <div>
      <h3>Portfolio</h3>

      {rows.map(h => (
        <div key={h.symbol}>
          <strong>{h.symbol}</strong><br />
          Qty: {h.quantity}<br />
          Avg Price: ₹{h.avgPrice.toFixed(2)}<br />
          Current Price: ₹{h.price.toFixed(2)}<br />
          <span style={{ color: h.pl >= 0 ? "green" : "red" }}>
            P/L: ₹{h.pl.toFixed(2)}
          </span>
          <hr />
        </div>
      ))}

      <h4 style={{ color: totalPL >= 0 ? "green" : "red" }}>
        Total P/L: ₹{totalPL.toFixed(2)}
      </h4>
    </div>
  );
};

export default Portfolio;