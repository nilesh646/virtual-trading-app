const Market = ({ prices = {}, onBuy, balance = 0 }) => {
  const symbols = Object.keys(prices || {});

  return (
    <div>
      <h3>Market</h3>

      {symbols.length === 0 && <p>Loading prices...</p>}

      {symbols.map(symbol => {
        const price = prices[symbol];
        const canBuy = balance >= price;

        return (
          <div key={symbol}>
            <strong>{symbol}</strong> – ₹{price?.toFixed(2)}
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