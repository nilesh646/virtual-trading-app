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
  const [prices, setPrices] = useState({}); // 🔥 NEW

  const loadWallet = async () => {
    try {
      const res = await api.get("/api/wallet");
      setWallet(res.data);
    } catch (err) {
      console.error("Wallet fetch failed", err);
    }
  };

  const loadPrices = async () => {
    try {
      const res = await api.get("/api/market");

      // 🔥 Convert array → object
      const priceMap = {};
      res.data.forEach(item => {
        priceMap[item.symbol] = item.price;
      });

      setPrices(priceMap);
    } catch (err) {
      console.error("Price fetch failed", err);
    }
  };

  useEffect(() => {
    if (token) {
      loadWallet();
      loadPrices();

      const interval = setInterval(loadPrices, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <div className="container">
      <h2>Trading Dashboard</h2>
      <button onClick={logout}>Logout</button>

      {wallet ? (
        <>
          <div className="card">
            <h3>Account Balance</h3>
            <p>₹{wallet.balance}</p>
          </div>

          <div className="flex">
            <div className="card" style={{ flex: 1 }}>
              <Market
                prices={prices}   // 🔥 PASS PRICES
                onBuy={async (symbol) => {
                  await api.post("/api/trade/buy", { symbol, quantity: 1 });
                  await loadWallet();
                  await loadPrices();
                }}
              />
            </div>

            <div className="card" style={{ flex: 1 }}>
              <Trade refreshWallet={loadWallet} />
            </div>
          </div>

          <div className="card">
            <Portfolio
              holdings={wallet.holdings}
              prices={prices}   // 🔥 PASS PRICES
            />
          </div>

          <div className="card">
            <PriceChart prices={prices} /> {/* 🔥 LIVE CHART */}
          </div>

          <div className="card">
            <PortfolioChart holdings={wallet.holdings} />
          </div>

          <div className="card">
            <Analytics />
          </div>

          <div className="card">
            <History />
          </div>
        </>
      ) : (
        <p>Loading wallet...</p>
      )}
    </div>
  );
};

export default Dashboard;



