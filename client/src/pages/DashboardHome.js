import Market from "../components/Market";
import Trade from "../components/Trade";
import MarketMovers from "../components/MarketMovers";

const DashboardHome = ({
  wallet,
  marketData,
  buyStock,
  sellStock,
  refreshWallet
}) => {
  if (!wallet) return null;

  return (
    <>
      {/* ===== BALANCE CARD ===== */}
      <div className="card">
        <h3>Account Balance</h3>
        <h2>₹{wallet.balance.toFixed(2)}</h2>
      </div>

      {/* ===== MARKET MOVERS ===== */}
      <div className="card">
        <MarketMovers prices={marketData} />
      </div>

      {/* ===== MARKET + TRADE SIDE BY SIDE ===== */}
      <div className="grid-2">
        <div className="card">
          <Market
            prices={marketData}
            balance={wallet.balance}
            holdings={wallet.holdings}
            onBuy={buyStock}
            onSell={sellStock}
          />
        </div>

        <div className="card">
          <Trade refreshWallet={refreshWallet} />
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
