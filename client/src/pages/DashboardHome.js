import Market from "../components/Market";
import Trade from "../components/Trade";
import MarketMovers from "../components/MarketMovers";
import MarketHeatmap from "../components/MarketHeatmap";
import MarketAlerts from "../components/MarketAlerts";
import MarketOpportunities from "../components/MarketOpportunities";
import AIRecommendations from "../components/AIRecommendations";

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
  sectorStrength,
  tradeScore,
  opportunityMap
}) => {
  if (!wallet) return null;

  // 🧠 AI SUMMARY (NEW)
  const topSector = Object.entries(sectorStrength)
    .sort((a, b) => b[1] - a[1])[0];

  const topStock = Object.entries(momentumScore)
    .sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      {/* ================= ACCOUNT ================= */}
      <div className="card">
        <h3>Account Balance</h3>
        <p>₹{wallet.balance.toFixed(2)}</p>
      </div>

      {/* ================= AI SUMMARY (NEW) ================= */}
      <div className="card">
        <h3>🧠 AI Market Summary</h3>
        <p>🔥 Strongest Sector: {topSector?.[0]}</p>
        <p>🚀 Top Momentum Stock: {topStock?.[0]}</p>
      </div>

      {/* ================= ALERTS ================= */}
      <div className="card">
        <MarketAlerts
          prices={marketData}
          changeMap={changeMap}
          momentumScore={momentumScore}
          sectorStrength={sectorStrength}
        />
      </div>

      <div className="card">
        <AIRecommendations />
      </div>

      {/* ================= MARKET SECTION ================= */}
      <div className="grid-2">
        <div className="card">
          <MarketMovers prices={marketData} />
        </div>

        <div className="card">
          <MarketHeatmap
            prices={marketData}
            onBuy={buyStock}
          />
        </div>
      </div>

      {/* ================= OPPORTUNITIES ================= */}
      <div className="card">
        <MarketOpportunities
          prices={marketData}
          changeMap={changeMap}
          tradeScore={tradeScore}   // ✅ FIXED
          sectorStrength={sectorStrength}
          opportunityMap={opportunityMap}
        />
      </div>

      {/* ================= TRADING AREA ================= */}
      <div className="trading-layout">

        {/* LEFT — MARKET */}
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
              tradeScore={tradeScore}
              opportunityMap={opportunityMap}
            />
          </div>
        </div>

        {/* RIGHT — TRADE */}
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