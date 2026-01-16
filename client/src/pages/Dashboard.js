import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

import Market from "../components/Market";
import Trade from "../components/Trade";
import Portfolio from "../components/Portfolio";
import History from "../components/History";
import PriceChart from "../components/PriceChart";
import PortfolioChart from "../components/PortfolioChart";
import Analytics from "../components/Analytics";

const Dashboard = () => {
  const { logout, token } = useContext(AuthContext);

  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Load wallet
  const loadWallet = async () => {
    try {
      const res = await api.get("/api/wallet");
      setWallet(res.data);
    } catch (err) {
      console.error("Wallet fetch failed:", err);
      setWallet(null);
    }
  };

  // 🔹 Load market prices
  const loadPrices = async () => {
    try {
      const res = await api.get("/api/market");
      const priceMap = {};
      res.data.forEach(item => {
        priceMap[item.symbol] = item.price;
      });
      setPrices(priceMap);
    } catch (err) {
      console.error("Price fetch failed:", err);
    }
  };

  // 🔹 Initial load after token is ready
  useEffect(() => {
    if (!token) return;

    const init = async () => {
      setLoading(true);
      await loadWallet();
      await loadPrices();
      setLoading(false);
    };

    init();

    const interval = setInterval(loadPrices, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="container">
        <h2>Trading Dashboard</h2>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Trading Dashboard</h2>
      <button onClick={logout}>Logout</button>

      {!wallet ? (
        <p>Failed to load wallet</p>
      ) : (
        <>
          {/* Balance */}
          <div className="card">
            <h3>Account Balance</h3>
            <p>₹{wallet.balance}</p>
          </div>

          {/* Market + Trade */}
          <div className="flex">
            <div className="card" style={{ flex: 1 }}>
              <Market
                prices={prices}
                onBuy={async (symbol) => {
                  await api.post("/api/trade/buy", {
                    symbol,
                    quantity: 1
                  });
                  await loadWallet();
                  await loadPrices();
                }}
              />
            </div>

            <div className="card" style={{ flex: 1 }}>
              <Trade refreshWallet={loadWallet} />
            </div>
          </div>

          {/* Portfolio */}
          <div className="card">
            <Portfolio
              holdings={wallet.holdings || []}
              prices={prices}
            />
          </div>

          {/* Charts */}
          <div className="card">
            <PriceChart prices={prices} />
          </div>

          <div className="card">
            <PortfolioChart holdings={wallet.holdings || []} />
          </div>

          {/* Analytics */}
          <div className="card">
            <Analytics />
          </div>

          {/* History */}
          <div className="card">
            <History />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;



