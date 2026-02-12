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

import { SECTOR_MAP } from "../data/sectors";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [wallet, setWallet] = useState(null);
  const [equityCurve, setEquityCurve] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [watchlist, setWatchlist] = useState([]);
  const [priceHistory, setPriceHistory] = useState({});

  /* =====================================================
     LOAD WALLET
  ===================================================== */
  const loadWallet = useCallback(async () => {
    try {
      const res = await api.get("/api/wallet");
      setWallet(res.data);
    } catch (err) {
      console.error("Wallet fetch failed", err);
    }
  }, []);

  /* =====================================================
     LOAD MARKET PRICES
  ===================================================== */
  const loadPrices = useCallback(async () => {
    try {
      const res = await api.get("/api/market");

      const freshMarket = {};

      res.data.forEach(stock => {
        const price = Number(stock.price);

        freshMarket[stock.symbol] = {
          ...stock,
          price
        };
      });

      // SAFE HISTORY UPDATE
      setPriceHistory(prev => {
        const updated = { ...prev };

        res.data.forEach(stock => {
          const price = Number(stock.price);
          if (isNaN(price)) return;

          if (!updated[stock.symbol]) {
            updated[stock.symbol] = [];
          }

          updated[stock.symbol].push(price);

          if (updated[stock.symbol].length > 30) {
            updated[stock.symbol].shift();
          }
        });

        return updated;
      });

      setMarketData(freshMarket);

    } catch (err) {
      console.error("Price fetch failed");
    }
  }, []);

  /* =====================================================
     GLOBAL MARKET INTELLIGENCE (WEEK 15 DAY 7)
  ===================================================== */

  // price map
  const prices = useMemo(() => {
    const map = {};
    Object.entries(marketData).forEach(([symbol, data]) => {
      map[symbol] = data.price;
    });
    return map;
  }, [marketData]);

  // % change map
  const changeMap = useMemo(() => {
    const map = {};
    Object.entries(marketData).forEach(([symbol, stock]) => {
      map[symbol] = Number(stock.changePercent || 0);
    });
    return map;
  }, [marketData]);

  // momentum score (0–100)
  const momentumScore = useMemo(() => {
    const scores = {};

    Object.entries(marketData).forEach(([symbol, stock]) => {
      const change = Number(stock.changePercent || 0);

      scores[symbol] = Math.round(
        Math.min(100, Math.max(0, change * 20 + 50))
      );
    });

    return scores;
  }, [marketData]);

  // sector strength
  const sectorStrength = useMemo(() => {
    const sectors = {};

    Object.entries(marketData).forEach(([symbol, stock]) => {
      const sector = SECTOR_MAP[symbol] || "Others";
      const change = Number(stock.changePercent || 0);

      if (!sectors[sector]) sectors[sector] = [];
      sectors[sector].push(change);
    });

    const result = {};

    Object.entries(sectors).forEach(([sector, values]) => {
      result[sector] =
        values.reduce((a, b) => a + b, 0) / values.length;
    });

    return result;
  }, [marketData]);

  const opportunityMap = useMemo(() => {
    const map = {};

    Object.entries(marketData).forEach(([symbol, stock]) => {
      const change = Number(stock.changePercent || 0);
      const momentum = momentumScore[symbol] || 0;

      if (momentum > 75 && change > 0.5) {
        map[symbol] = {
          type: "momentum",
          confidence: "HIGH"
        };
      } else if (momentum > 60 && change > 0.2) {
        map[symbol] = {
          type: "trend",
          confidence: "MEDIUM"
        };
      }
    });

    return map;
  }, [marketData, momentumScore]);


  // ================= TRADE SCORE (WEEK 16 DAY 1) =================
  const tradeScore = useMemo(() => {
    const scores = {};

    Object.entries(marketData).forEach(([symbol, stock]) => {
      const change = Number(stock.changePercent || 0);
      const momentum = momentumScore[symbol] || 50;

      const sector = SECTOR_MAP[symbol] || "Others";
      const sectorValue = sectorStrength[sector] || 0;

      // normalize values to 0–100 scale
      const changeScore = Math.min(100, Math.max(0, change * 20 + 50));
      const sectorScore = Math.min(100, Math.max(0, sectorValue * 20 + 50));

      const score =
        momentum * 0.5 +
        changeScore * 0.3 +
        sectorScore * 0.2;

      scores[symbol] = Math.round(score);
    });

    return scores;
  }, [marketData, momentumScore, sectorStrength]);

  /* =====================================================
     LOAD EQUITY CURVE
  ===================================================== */
  const loadEquityCurve = useCallback(async () => {
    try {
      const res = await api.get("/api/analytics/equity-curve");
      setEquityCurve(res.data);
    } catch (err) {
      console.error("Equity curve load failed");
    }
  }, []);

  /* =====================================================
     BUY / SELL
  ===================================================== */
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

  /* =====================================================
     WATCHLIST
  ===================================================== */
  const loadWatchlist = useCallback(async () => {
    try {
      const res = await api.get("/api/watchlist");
      setWatchlist(res.data || []);
    } catch (err) {
      console.error("Watchlist load failed", err);
    }
  }, []);
  

  /* =====================================================
     AUTO REFRESH
  ===================================================== */
  useEffect(() => {
    if (!token) return;

    loadWallet();
    loadPrices();
    loadEquityCurve();
    loadWatchlist();

    const interval = setInterval(() => {
      loadPrices();
      loadWallet();
    }, 5000);

    return () => clearInterval(interval);
  }, [
    token,
    loadWallet,
    loadPrices,
    loadEquityCurve,
    loadWatchlist
  ]);

  if (!wallet && token) return <p>Loading wallet...</p>;

  /* =====================================================
     UI
  ===================================================== */
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
            index
            element={
              <DashboardHome
                wallet={wallet}
                marketData={marketData}
                buyStock={buyStock}
                sellStock={sellStock}
                refreshWallet={loadWallet}
                watchlist={watchlist}
                setWatchlist={setWatchlist}
                priceHistory={priceHistory}
                changeMap={changeMap}
                momentumScore={momentumScore}
                sectorStrength={sectorStrength}
                tradeScore={tradeScore}
                opportunityMap={opportunityMap}
              />
            }
          />

          <Route
            path="portfolio"
            element={
              <PortfolioPage
                wallet={wallet}
                prices={prices}
              />
            }
          />

          <Route
            path="analytics"
            element={<AnalyticsPage equityCurve={equityCurve} />}
          />

          <Route path="highlights" element={<TradeHighlightsPage />} />
          <Route path="strategy" element={<StrategyPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
