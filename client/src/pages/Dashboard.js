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
  const { logout } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);

  const loadWallet = () => {
    api.get("/api/wallet").then(res => setWallet(res.data));
  };

  useEffect(() => {
    loadWallet();
  }, []);

    return (
    <div className="container">
      <h2>Trading Dashboard</h2>
      <button onClick={logout}>Logout</button>

      {wallet && (
        <>
          <div className="card">
            <h3>Account Balance</h3>
            <p>₹{wallet.balance}</p>
          </div>

          <div className="flex">
            <div className="card" style={{ flex: 1 }}>
              <Market
                onBuy={(symbol) =>
                  api.post("/api/trade/buy", { symbol, quantity: 1 })
                    .then(loadWallet)
                }
              />
            </div>

            <div className="card" style={{ flex: 1 }}>
              <Trade refreshWallet={loadWallet} />
            </div>
          </div>

          <div className="card">
            <Portfolio holdings={wallet.holdings} />
          </div>

          <div className="card">
            <PriceChart symbol="AAPL" prices={[260, 258, 255, 257, 260]} />
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
      )}
    </div>
  );
};

export default Dashboard;



