const Market = ({ prices = {}, onBuy, onSell, balance = 0, holdings = [] }) => {
  const getHoldingQty = (symbol) => {
    const h = holdings.find(x => x.symbol === symbol);
    return h ? h.quantity : 0;
  };

  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading market data...</p>;
  }

  return (
    <div>
      <h3>Market</h3>

      {Object.entries(prices).map(([symbol, stock]) => {
        // 🛑 STOCK IS AN OBJECT → extract price safely
        const price = Number(stock?.price || 0);

        const canBuy = balance >= price;
        const ownedQty = getHoldingQty(symbol);

        return (
          <div key={symbol}>
            <strong>{symbol}</strong> – ₹{price.toFixed(2)}
            <br />

            <button
              disabled={!canBuy}
              onClick={() => onBuy(symbol)}
            >
              {canBuy ? "Buy 1" : "No Balance"}
            </button>

            <button
              disabled={ownedQty < 1}
              onClick={() => onSell(symbol)}
              style={{ marginLeft: "8px" }}
            >
              Sell 1
            </button>

            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default Market;
