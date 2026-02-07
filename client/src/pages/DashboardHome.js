import Market from "../components/Market";
import Trade from "../components/Trade";
import MarketMovers from "../components/MarketMovers";
import MarketHeatmap from "../components/MarketHeatmap";

const DashboardHome = ({
  wallet,
  marketData,
  buyStock,
  sellStock,
  refreshWallet,
  watchlist,
  setWatchlist,
  priceHistory
}) => {
  if (!wallet) return null;

  return (
    <>
      <div className="card">
        <h3>Account Balance</h3>
        <p>₹{wallet.balance.toFixed(2)}</p>
      </div>

      <div className="card">
        <MarketMovers prices={marketData} />
      </div>

      <div className="card">
        <MarketHeatmap
          prices={marketData}
          onBuy={buyStock}
        />
      </div>

      <div className="trading-layout">

        {/* LEFT SIDE — MARKET AREA */}
        <div className="market-panel">

          <div className="card">
            <Market
              prices={marketData}
              balance={wallet.balance}
              holdings={wallet.holdings}
              watchlist={watchlist}
              setWatchlist={setWatchlist}
              onBuy={buyStock}
              onSell={sellStock}
              priceHistory={priceHistory}
            />
          </div>

        </div>

        {/* RIGHT SIDE — TRADE PANEL */}
        <div className="trade-panel">
          <div className="card">
            <Trade refreshWallet={refreshWallet} />
          </div>
        </div>

      </div>
    </>
  );
};

export default DashboardHome;
