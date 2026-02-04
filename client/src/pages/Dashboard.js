import { Routes, Route, Link } from "react-router-dom";

import DashboardHome from "./DashboardHome";
import PortfolioPage from "./PortfolioPage";
import AnalyticsPage from "./AnalyticsPage";
import TradeHighlightsPage from "./TradeHighlightsPage";
import HistoryPage from "./HistoryPage";
import StrategyPage from "./StrategyPage";
import AIPage from "./AIPage";

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

// import Market from "../components/Market";
// import Trade from "../components/Trade";
// import Portfolio from "../components/Portfolio";
// import History from "../components/History";
// import PriceChart from "../components/PriceChart";
// import PortfolioChart from "../components/PortfolioChart";
// import Analytics from "../components/Analytics";
// import EquityCurveChart from "../components/EquityCurveChart";
// import AllocationChart from "../components/AllocationChart";
// import RiskMeter from "../components/RiskMeter";
// import MarketMovers from "../components/MarketMovers";
// import TradeLeaders from "../components/TradeLeaders";
// import StrategyPerformance from "../components/StrategyPerformance";
// import StrategyEquityCurves from "../components/StrategyEquityCurves";
// import StrategyStats from "../components/StrategyStats";
// import StrategyPerformanceChart from "../components/StrategyPerformanceChart";
// import TraderScore from "../components/TraderScore";
// import StrategyLeaderboard from "../components/StrategyLeaderboard";
// import MonthlyReport from "../components/MonthlyReport";
// import TradeExtremes from "../components/TradeExtremes";
// import DailyPLChart from "../components/DailyPLChart";
// import StreakStats from "../components/StreakStats";
// import DrawdownCard from "../components/DrawdownCard";
// import SharpeCard from "../components/SharpeCard";
// import SortinoCard from "../components/SortinoCard";
// import ProfitFactorCard from "../components/ProfitFactorCard";
// import ExpectancyCard from "../components/ExpectancyCard";
// import RiskRewardCard from "../components/RiskRewardCard";
// import TradeDurationCard from "../components/TradeDurationCard";
// import AIInsights from "../components/AIInsights";
// import AIMistakes from "../components/AIMistakes";
// import AITradeScores from "../components/AITradeScores";
// import AIWeeklyReport from "../components/AIWeeklyReport";
// import StrategyBreakdown from "../components/StrategyBreakdown";
// import TradeMistakes from "../components/TradeMistakes";


const Dashboard = () => {
  const { logout, token } = useContext(AuthContext);

  const [wallet, setWallet] = useState(null);
  // const [prices, setPrices] = useState({});
  const [equityCurve, setEquityCurve] = useState([]);
  // const [priceHistory, setPriceHistory] = useState({});
  const [marketData, setMarketData] = useState({});


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
          price: Number(stock.price) // ensure number
        };
      });

      // ✅ Always replace state (not merge)
      setMarketData(freshMarket);

    } catch (err) {
      console.error("Price fetch failed", err);
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


  // ================= LIVE TOTAL P/L =================
  // const totalPL = useMemo(() => {
  //   if (!wallet?.holdings?.length) return 0;

  //   return wallet.holdings.reduce((sum, h) => {
  //     const currentPrice = prices[h.symbol] ?? h.avgPrice;
  //     return sum + (currentPrice - h.avgPrice) * h.quantity;
  //   }, 0);
  // }, [wallet, prices]);

  // const interval = setInterval(() => {
  //   loadPrices();
  //   loadWallet();
  //   api.post("/api/trade/auto-sell-check"); // 🔥 AUTO SELL ENGINE
  // }, 5000);


  // ================= GUARDS =================
  if (!token) return null;
  if (!wallet) return <p>Loading wallet...</p>;

  <div className="nav">
    <Link to="/dashboard">Home</Link>
    <Link to="/portfolio">Portfolio</Link>
    <Link to="/analytics">Analytics</Link>
    <Link to="/highlights">Highlights</Link>
    <Link to="/strategy">Strategies</Link>
    <Link to="/ai">AI</Link>
    <Link to="/history">History</Link>
  </div>


 return (
    <div className="container">
      <h2>Trading Dashboard</h2>
      <button onClick={logout}>Logout</button>

      {/* 🔹 NAVIGATION MENU */}
      <div className="nav" style={{ marginBottom: "20px" }}>
        <Link to="/dashboard">Home</Link> |{" "}
        <Link to="/portfolio">Portfolio</Link> |{" "}
        <Link to="/analytics">Analytics</Link> |{" "}
        <Link to="/highlights">Highlights</Link> |{" "}
        <Link to="/strategy">Strategies</Link> |{" "}
        <Link to="/ai">AI</Link> |{" "}
        <Link to="/history">History</Link>
      </div>

      {/* 🔹 PAGE ROUTES */}
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
          element={<PortfolioPage wallet={wallet} prices={prices} />}
        />

        <Route
          path="/analytics"
          element={<AnalyticsPage equityCurve={equityCurve} />}
        />

        <Route path="/highlights" element={<TradeHighlightsPage />} />
        <Route path="/strategy" element={<StrategyPage />} />
        <Route path="/ai" element={<AIPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </div>
  );
};

export default Dashboard;