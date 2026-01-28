import { useState } from "react";

const Market = ({ prices = {}, onBuy, onSell, balance = 0, holdings = [] }) => {
  // Store SL/TP per symbol
  const [riskInputs, setRiskInputs] = useState({});

  const getHoldingQty = (symbol) => {
    const h = holdings.find(x => x.symbol === symbol);
    return h ? h.quantity : 0;
  };

  const updateRisk = (symbol, field, value) => {
    setRiskInputs(prev => ({
      ...prev,
      [symbol]: {
        ...prev[symbol],
        [field]: Number(value)
      }
    }));
  };

  if (!prices || Object.keys(prices).length === 0) {
    return <p>Loading market data...</p>;
  }

  return (
    <div>
      <h3>Market</h3>

      {Object.entries(prices).map(([symbol, stock]) => {
        const price = Number(stock?.price || 0);
        const canBuy = balance >= price;
        const ownedQty = getHoldingQty(symbol);

        const stopLoss = riskInputs[symbol]?.stopLoss || "";
        const takeProfit = riskInputs[symbol]?.takeProfit || "";

        return (
          <div key={symbol}>
            <strong>{symbol}</strong> – ₹{price.toFixed(2)}
            <br />

            <button
              disabled={!canBuy}
              onClick={() =>
                onBuy(symbol, {
                  stopLoss: stopLoss || undefined,
                  takeProfit: takeProfit || undefined
                })
              }
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

            <br />

            {/* Stop Loss */}
            <input
              type="number"
              placeholder="Stop Loss"
              value={stopLoss}
              onChange={(e) => updateRisk(symbol, "stopLoss", e.target.value)}
              style={{ marginTop: "6px", marginRight: "6px" }}
            />

            {/* Take Profit */}
            <input
              type="number"
              placeholder="Take Profit"
              value={takeProfit}
              onChange={(e) => updateRisk(symbol, "takeProfit", e.target.value)}
            />

            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default Market;
