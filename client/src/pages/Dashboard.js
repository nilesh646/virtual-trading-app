import { Routes, Route, useNavigate } from "react-router-dom";
import {
  useEffect,
  useState,
  useContext,
  useCallback,
  useMemo
} from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";

import DashboardHome from "./DashboardHome";
import PortfolioPage from "./PortfolioPage";
import AnalyticsPage from "./AnalyticsPage";
import TradeHighlightsPage from "./TradeHighlightsPage";
import HistoryPage from "./HistoryPage";
import StrategyPage from "./StrategyPage";
import AIPage from "./AIPage";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [wallet, setWallet] = useState(null);
  const [equityCurve, setEquityCurve] = useState([]);
  const [marketData, setMarketData] = useState({});

  // 🔐 REDIRECT IF LOGGED OUT (MUST BE BEFORE ANY RETURNS)
  // useEffect(() => {
  //   if (!token) {
  //     navigate("/login");
  //   }
  // }, [token, navigate]);

  // ================= LOAD WALLET =================
  const loadWallet = useCallback(async () => {
    try {
      const res = await api.get("/api/wallet");
      setWallet(res.data);
    } catch (err) {
      console.error("Wallet fetch failed", err);
    }
  }, []);

  // ================= LOAD MARKET PRICES =================
  const loadPrices = useCallback(async () => {
    try {
      const res = await api.get("/api/market");

      const freshMarket = {};
      res.data.forEach(stock => {
        freshMarket[stock.symbol] = {
          ...stock,
          price: Number(stock.price)
        };
      });

      setMarketData(freshMarket);
    } catch (err) {
      console.error("Price fetch failed");
    }
  }, []);

  const prices = useMemo(() => {
    const map = {};
    Object.entries(marketData).forEach(([symbol, data]) => {
      map[symbol] = data.price;
    });
    return map;
  }, [marketData]);

  // ================= LOAD EQUITY CURVE =================
  const loadEquityCurve = useCallback(async () => {
    try {
      const res = await api.get("/api/analytics/equity-curve");
      setEquityCurve(res.data);
    } catch (err) {
      console.error("Equity curve load failed", err);
    }
  }, []);

  // ================= BUY =================
  const buyStock = useCallback(
    async (symbol, stopLoss = null, takeProfit = null) => {
      try {
        await api.post("/api/trade/buy", {
          symbol,
          quantity: 1,
          stopLoss,
          takeProfit
        });

        toast.success(`Bought 1 ${symbol}`);
        await loadWallet();
        await loadPrices();
        await loadEquityCurve();
      } catch (err) {
        toast.error(err.response?.data?.error || "Buy failed");
      }
    },
    [loadWallet, loadPrices, loadEquityCurve]
  );

  // ================= SELL =================
  const sellStock = useCallback(
    async (symbol) => {
      try {
        await api.post("/api/trade/sell", { symbol, quantity: 1 });
        toast.success(`Sold 1 ${symbol}`);
        await loadWallet();
        await loadPrices();
        await loadEquityCurve();
      } catch (err) {
        toast.error(err.response?.data?.error || "Sell failed");
      }
    },
    [loadWallet, loadPrices, loadEquityCurve]
  );

  // ================= AUTO REFRESH =================
  useEffect(() => {
    if (!token) return;

    loadWallet();
    loadPrices();
    loadEquityCurve();

    const interval = setInterval(() => {
      loadPrices();
      loadWallet();
    }, 5000);

    return () => clearInterval(interval);
  }, [token, loadWallet, loadPrices, loadEquityCurve]);

  // ⏳ WAIT FOR WALLET
  if (!wallet && token) return <p>Loading wallet...</p>;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="logout-btn"
        >
          Logout
        </button>

        <Routes>
          <Route
            path="/dashboard"
            element={
              <DashboardHome
                wallet={wallet}
                marketData={marketData}
                buyStock={buyStock}
                sellStock={sellStock}
                refreshWallet={loadWallet}
              />
            }
          />


          <Route
            path="/portfolio"
            element={
              <PortfolioPage
                wallet={wallet}
                prices={prices}
                marketData={marketData}
                refreshWallet={loadWallet}
              />
            }
          />

          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                equityCurve={equityCurve}
                wallet={wallet}
              />
            }
          />

          <Route path="/highlights" element={<TradeHighlightsPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/history" element={<HistoryPage refreshWallet={loadWallet} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
