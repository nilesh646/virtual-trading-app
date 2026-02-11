import Market from "../components/Market";
import Trade from "../components/Trade";
import MarketMovers from "../components/MarketMovers";
import MarketHeatmap from "../components/MarketHeatmap";
import MarketAlerts from "../components/MarketAlerts";
import MarketOpportunities from "../components/MarketOpportunities";

const DashboardHome = ({
  wallet,
  marketData,
  buyStock,
  sellStock,
  refreshWallet,
  watchlist,
  setWatchlist,
  priceHistory,
  changeMap,
  momentumScore,
  sectorStrength
}) => {
  if (!wallet) return null;

  return (
    <>
      {/* ================= ACCOUNT ================= */}
      <div className="card">
        <h3>Account Balance</h3>
        <p>₹{wallet.balance.toFixed(2)}</p>
      </div>

      {/* ================= MARKET ALERTS ================= */}
      <div className="card">
        <MarketAlerts
          prices={marketData}
          changeMap={changeMap}
          momentumScore={momentumScore}
          sectorStrength={sectorStrength}
        />
      </div>

      {/* ================= MARKET MOVERS ================= */}
      <div className="card">
        <MarketMovers prices={marketData} />
      </div>

      {/* ================= HEATMAP ================= */}
      <div className="card">
        <MarketHeatmap
          prices={marketData}
          onBuy={buyStock}
        />
      </div>

      {/* ================= OPPORTUNITIES ================= */}
      <div className="card">
        <MarketOpportunities
          prices={marketData}
          momentumScore={momentumScore}
          sectorStrength={sectorStrength}
        />
      </div>

      {/* ================= TRADING AREA ================= */}
      <div className="trading-layout">

        {/* LEFT SIDE — MARKET */}
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
