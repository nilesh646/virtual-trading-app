import { useEffect, useState, useContext, useCallback } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Market from "../components/Market";
import Trade from "../components/Trade";
import Portfolio from "../components/Portfolio";
import History from "../components/History";
import PriceChart from "../components/PriceChart";
import PortfolioChart from "../components/PortfolioChart";
import Analytics from "../components/Analytics";
import EquityCurveChart from "../components/EquityCurveChart";


const Dashboard = () => {
  const { logout, token } = useContext(AuthContext);

  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState({});
  const [equityCurve, setEquityCurve] = useState([]);

  // ✅ MEMOIZED FUNCTION
  const loadWallet = useCallback(async () => {
  try {
    const res = await api.get("/api/wallet");
    setWallet(res.data);
  } catch (err) {
    console.error("Wallet fetch failed", err);
  }
 }, []);

  const loadPrices = useCallback(async () => {
    try {
      const res = await api.get("/api/market");
      const priceMap = {};
      res.data.forEach(item => {
        priceMap[item.symbol] = item.price;
      });
      setPrices(priceMap);
    } catch (err) {
      console.error("Price fetch failed", err);
    }
  }, []);

  const loadEquityCurve = useCallback(async () => {
    try {
      const res = await api.get("/api/analytics/equity-curve");
      setEquityCurve(res.data);
    } catch (err) {
      console.error("Equity curve load failed", err);
    }
  }, []);



  // ✅ ESLINT-SAFE useEffect
  useEffect(() => {
    if (token) {
      loadWallet();
      loadPrices();
      loadEquityCurve();
    }
  }, [token, loadWallet, loadPrices, loadEquityCurve]);


  if (!wallet) {
    return <p>Loading wallet...</p>;
  }

  if (!token) return null;

  return (
    <div className="container">
      <h2>Trading Dashboard</h2>
      <button onClick={logout}>Logout</button>

      <div className="card">
        <h3>Account Balance</h3>
        <p>₹{wallet.balance}</p>
      </div>

      <div className="flex">
        <div className="card" style={{ flex: 1 }}>
          <Market
            prices={prices}
            balance={wallet.balance}
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
          prices={prices}
          refreshWallet={loadWallet}
        />
      </div>

      <div className="card">
        <PriceChart prices={prices} />
      </div>

      <div className="card">
        <PortfolioChart holdings={wallet.holdings} />
      </div>

      <div className="card">
        <Analytics />
        <EquityCurveChart />
      </div>

      <div className="card">
        <EquityCurveChart data={equityCurve} />
      </div>


      <div className="card">
        <History />
      </div>
    </div>
  );
};

export default Dashboard;




