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
import toast from "react-hot-toast";

const Dashboard = () => {
  const { logout, token } = useContext(AuthContext);

  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState({});

  // 🔹 Load wallet
  const loadWallet = async () => {
    try {
      const res = await api.get("/api/wallet/");
      setWallet(res.data);
    } catch (err) {
      console.error("Wallet fetch failed", err);
      toast.error("Failed to load wallet");
    }
  };

  // 🔹 Load market prices
  const loadPrices = async () => {
    try {
      const res = await api.get("/api/market");

      // Convert array → object
      const priceMap = {};
      res.data.forEach(item => {
        priceMap[item.symbol] = item.price;
      });

      setPrices(priceMap);
    } catch (err) {
      console.error("Price fetch failed", err);
      toast.error("Failed to load prices");
    }
  };

  // 🔹 Initial load + auto refresh prices
  useEffect(() => {
    if (!token) return;

    loadWallet();
    loadPrices();

    const interval = setInterval(loadPrices, 5000);
    return () => clearInterval(interval);
  }, [token]);


  return (
    <div className="container">
      <h2>Trading Dashboard</h2>
      <button onClick={logout}>Logout</button>

      {wallet ? (
        <>
          {/* 💰 Balance */}
          <div className="card">
            <h3>Account Balance</h3>
            <p>₹{wallet.balance}</p>
          </div>

          {/* Empty state */}
          {wallet.holdings.length === 0 && (
            <p style={{ marginTop: "10px", color: "#666" }}>
              You don’t own any stocks yet. Buy one to get started 🚀
            </p>
          )}

          {/* 📈 Market & Trade */}
          <div className="flex">
            <div className="card" style={{ flex: 1 }}>
              <Market
                prices={prices}
                onBuy={async (symbol) => {
                  try {
                    await api.post("/api/trade/buy", {
                      symbol,
                      quantity: 1
                    });

                    toast.success(`Bought ${symbol} successfully ✅`);

                    await loadWallet();
                    await loadPrices();
                  } catch (err) {
                    toast.error(
                      err.response?.data?.error || "Trade failed ❌"
                    );
                  }
                }}
              />
            </div>

            <div className="card" style={{ flex: 1 }}>
              <Trade refreshWallet={loadWallet} />
            </div>
          </div>

          {/* 📊 Portfolio */}
          <div className="card">
            <Portfolio
              holdings={wallet.holdings}
              prices={prices}
              refresh={async () => {
                await loadWallet();
                await loadPrices();
              }}
            />

          </div>

          {/* 📉 Live Price Chart */}
          <div className="card">
            <PriceChart prices={prices} />
          </div>

          {/* 🥧 Portfolio Chart */}
          <div className="card">
            <PortfolioChart holdings={wallet.holdings} />
          </div>

          {/* 📊 Analytics */}
          <div className="card">
            <Analytics />
          </div>

          {/* 📜 Trade History */}
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



