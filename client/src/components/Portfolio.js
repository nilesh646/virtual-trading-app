const Portfolio = ({ holdings }) => {
  return (
    <div>
      <h3>Portfolio</h3>
      {holdings.length === 0 && <p>No holdings</p>}
      {holdings.map(h => (
        <div key={h.symbol}>
          {h.symbol} | Qty: {h.quantity} | Avg: ₹{h.avgPrice}
        </div>
      ))}
    </div>
  );
};

export default Portfolio;
