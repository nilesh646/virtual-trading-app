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

import Market from "../components/Market";
import Trade from "../components/Trade";
import Portfolio from "../components/Portfolio";
import History from "../components/History";
import PriceChart from "../components/PriceChart";
import PortfolioChart from "../components/PortfolioChart";
import Analytics from "../components/Analytics";
import EquityCurveChart from "../components/EquityCurveChart";
import AllocationChart from "../components/AllocationChart";
import RiskMeter from "../components/RiskMeter";

const Dashboard = () => {
  const { logout, token } = useContext(AuthContext);

  const [wallet, setWallet] = useState(null);
  const [prices, setPrices] = useState({});
  const [equityCurve, setEquityCurve] = useState([]);
  const [priceHistory, setPriceHistory] = useState({});

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

      setPrices((prevPrices) => {
        const updatedPrices = { ...prevPrices };

        setPriceHistory((prevHistory) => {
          const updatedHistory = { ...prevHistory };

          res.data.forEach((stock) => {
            updatedPrices[stock.symbol] = stock.price;

            if (!updatedHistory[stock.symbol]) {
              updatedHistory[stock.symbol] = [];
            }

            updatedHistory[stock.symbol] = [
              ...updatedHistory[stock.symbol],
              stock.price
            ].slice(-10); // keep last 10 prices
          });

          return updatedHistory;
        });

        return updatedPrices;
      });
    } catch (err) {
      console.error("Price fetch failed", err);
    }
  }, []);

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
    async (symbol) => {
      try {
        await api.post("/api/trade/buy", { symbol, quantity: 1 });
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
      loadWallet(); // keeps P/L live
    }, 5000);

    return () => clearInterval(interval);
  }, [token, loadWallet, loadPrices, loadEquityCurve]);

  // ================= LIVE TOTAL P/L =================
  const totalPL = useMemo(() => {
    if (!wallet?.holdings?.length) return 0;

    return wallet.holdings.reduce((sum, h) => {
      const currentPrice = prices[h.symbol] ?? h.avgPrice;
      return sum + (currentPrice - h.avgPrice) * h.quantity;
    }, 0);
  }, [wallet, prices]);

  // ================= GUARDS =================
  if (!token) return null;
  if (!wallet) return <p>Loading wallet...</p>;

  return (
    <div className="container">
      <h2>Trading Dashboard</h2>
      <button onClick={logout}>Logout</button>

      <div className="card">
        <h3>Account Balance</h3>
        <p>₹{wallet.balance.toFixed(2)}</p>
      </div>

      <div className="card">
        <h3>Live Portfolio P/L</h3>
        <p
          style={{
            color: totalPL >= 0 ? "#00c853" : "#ff5252",
            fontWeight: "bold"
          }}
        >
          ₹{totalPL.toFixed(2)}
        </p>
      </div>

      <div className="flex">
        <div className="card" style={{ flex: 1 }}>
          <Market
            prices={prices}
            balance={wallet.balance}
            holdings={wallet.holdings}
            onBuy={buyStock}
            onSell={sellStock}
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
          priceHistory={priceHistory}
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
        <AllocationChart holdings={wallet.holdings} />
      </div>

      <div className="card">
        <RiskMeter holdings={wallet.holdings} />
      </div>

      <div className="card">
        <Analytics />
        <EquityCurveChart data={equityCurve} />
      </div>

      <div className="card">
        <History />
      </div>
    </div>
  );
};

export default Dashboard;