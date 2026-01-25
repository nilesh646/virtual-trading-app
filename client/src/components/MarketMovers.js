const MarketMovers = ({ prices = {} }) => {
  const stocks = Object.values(prices);

  if (!stocks.length) return <p>Loading market movers...</p>;

  return (
    <div>
      <h3>Market Movers</h3>

      {stocks.map((stock) => {
        const price = Number(stock.price);

        // 🛑 Skip if price invalid
        if (!price || isNaN(price)) return null;

        return (
          <div key={stock.symbol}>
            <strong>{stock.symbol}</strong> — ₹{price.toFixed(2)}
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default MarketMovers;

