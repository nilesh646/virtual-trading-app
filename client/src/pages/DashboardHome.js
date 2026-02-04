import Market from "../components/Market";
import Trade from "../components/Trade";
import MarketMovers from "../components/MarketMovers";

const DashboardHome = ({ wallet, marketData, buyStock, sellStock, refreshWallet }) => {
  return (
    <>
      <div className="card">
        <h3>Account Balance</h3>
        <p>₹{wallet.balance.toFixed(2)}</p>
      </div>

      <div className="card">
        <MarketMovers prices={marketData} />
      </div>

      <div className="flex">
        <div className="card" style={{ flex: 1 }}>
          <Market
            prices={marketData}
            balance={wallet.balance}
            holdings={wallet.holdings}
            onBuy={buyStock}
            onSell={sellStock}
          />
        </div>

        <div className="card" style={{ flex: 1 }}>
          <Trade refreshWallet={refreshWallet} />
        </div>
      </div>
    </>
  );
};

export default DashboardHome;
