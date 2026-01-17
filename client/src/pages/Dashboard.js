import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useEffect, useState, useContext, useCallback } from "react";


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

  // -------------------------
  // Load Wallet
  // -------------------------
   const loadWallet = useCallback(async () => {
    try {
      const res = await api.get("/api/wallet");
      setWallet(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        console.error("Wallet fetch failed", err);
      }
    }
  }, [logout]);



  // -------------------------
  // Load Market Prices
  // -------------------------
  const loadPrices = async () => {
    try {
      const res = await api.get("/api/market");

      const map = {};
      res.data.forEach(stock => {
        map[stock.symbol] = stock.price;
      });

      setPrices(map);
    } catch (err) {
      console.error("Market fetch failed", err);
      setPrices({});
    }
  };

  // -------------------------
  // Initial Load
  // -------------------------
  useEffect(() => {
    if (!token) return;

    const init = async () => {
      setLoading(true);
      await loadWallet();
      await loadPrices();
      setLoading(false);
    };

    init();

    const interval = setInterval(loadPrices, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // -------------------------
  // UI
  // -------------------------
  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>;
  }

  if (!wallet) {
    return <p style={{ padding: 20 }}>Failed to load wallet</p>;
  }

  return (
    <div className="container">
      <h2>Trading Dashboard</h2>
      <button onClick={logout}>Logout</button>

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

      {/* Price Chart */}
      <div className="card">
        {Object.keys(prices).length > 0 ? (
          <PriceChart prices={prices} />
        ) : (
          <p>No market data yet</p>
        )}
      </div>

      {/* Portfolio Chart */}
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
    </div>
  );
};

export default Dashboard;



