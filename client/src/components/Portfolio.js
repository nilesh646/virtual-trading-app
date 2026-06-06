import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Sparkline from "./Sparkline";
import "./Portfolio.css";

const Portfolio = ({
  holdings = [],
  prices = {},
  priceHistory = {},
  refreshWallet,
}) => {
  const [sellQty, setSellQty] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const [tagInputs, setTagInputs] = useState({});
  const [emotionInputs, setEmotionInputs] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});
  const [expanded, setExpanded] = useState({});
  const [selling, setSelling] = useState({});

  if (!holdings.length)
    return (
      <div className="pf-empty">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="#2a2a3d" strokeWidth="2" />
          <path d="M16 32l4-8 4 4 4-10 4 6" stroke="#4a4a6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p>No holdings yet</p>
        <span>Buy stocks to see your portfolio here</span>
      </div>
    );

  if (!prices || Object.keys(prices).length === 0)
    return (
      <div className="pf-empty">
        <div className="pf-spinner" />
        <p>Loading prices…</p>
      </div>
    );

  const sellStock = async (symbol) => {
    const qty = parseInt(sellQty[symbol]) || 1;
    const holding = holdings.find((h) => h.symbol === symbol);
    if (!holding || qty < 1 || qty > holding.quantity) {
      toast.error(`Enter a quantity between 1 and ${holding?.quantity}`);
      return;
    }
    setSelling((p) => ({ ...p, [symbol]: true }));
    try {
      await api.post("/api/trade/sell", {
        symbol,
        quantity: qty,
        notes: noteInputs[symbol] || "",
        tags: (tagInputs[symbol] || "").split(",").map((t) => t.trim()).filter(Boolean),
        emotion: emotionInputs[symbol] || "",
        rating: Number(ratingInputs[symbol]) || 0,
      });
      toast.success(`Sold ${qty} × ${symbol}`);
      refreshWallet();
      setNoteInputs((p) => ({ ...p, [symbol]: "" }));
      setTagInputs((p) => ({ ...p, [symbol]: "" }));
      setEmotionInputs((p) => ({ ...p, [symbol]: "" }));
      setRatingInputs((p) => ({ ...p, [symbol]: "" }));
      setSellQty((p) => ({ ...p, [symbol]: "" }));
    } catch (err) {
      toast.error(err.response?.data?.error || "Sell failed");
    } finally {
      setSelling((p) => ({ ...p, [symbol]: false }));
    }
  };

  const rows = holdings
    .map((h) => {
      const price = prices[h.symbol];
      if (!price) return null;
      const invested = h.quantity * h.avgPrice;
      const current = h.quantity * price;
      const pl = current - invested;
      const percent = invested !== 0 ? (pl / invested) * 100 : 0;
      const stopLoss = h.stopLoss || h.avgPrice * 0.95;
      const takeProfit = h.takeProfit || h.avgPrice * 1.1;
      return { ...h, price, pl, percent, stopLoss, takeProfit };
    })
    .filter(Boolean);

  const totalPL = rows.reduce((sum, r) => sum + r.pl, 0);
  const totalInvested = rows.reduce((sum, r) => sum + r.quantity * r.avgPrice, 0);
  const totalCurrent = rows.reduce((sum, r) => sum + r.quantity * r.price, 0);
  const totalPercent = totalInvested !== 0 ? (totalPL / totalInvested) * 100 : 0;

  const emotions = [
    { value: "", label: "— Emotion —" },
    { value: "confident", label: "😎 Confident" },
    { value: "fear", label: "😨 Fear" },
    { value: "greed", label: "🤑 Greed" },
    { value: "neutral", label: "😐 Neutral" },
  ];

  return (
    <div className="pf-root">
      {/* ── Header ── */}
      <div className="pf-header">
        <div className="pf-header-left">
          <h2 className="pf-title">Portfolio</h2>
          <span className="pf-count">{rows.length} position{rows.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="pf-summary-chips">
          <div className="pf-chip">
            <span className="pf-chip-label">Invested</span>
            <span className="pf-chip-value">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="pf-chip">
            <span className="pf-chip-label">Current</span>
            <span className="pf-chip-value">₹{totalCurrent.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`pf-chip pf-chip--pl ${totalPL >= 0 ? "pf-chip--gain" : "pf-chip--loss"}`}>
            <span className="pf-chip-label">Total P&L</span>
            <span className="pf-chip-value">
              {totalPL >= 0 ? "+" : ""}₹{totalPL.toFixed(2)}
              <em>{totalPercent >= 0 ? "+" : ""}{totalPercent.toFixed(2)}%</em>
            </span>
          </div>
        </div>
      </div>

      {/* ── Table header ── */}
      <div className="pf-table-head">
        <span>Symbol</span>
        <span>Qty</span>
        <span>Avg Price</span>
        <span>LTP</span>
        <span>P&L</span>
        <span>SL / TP</span>
        <span>Actions</span>
      </div>

      {/* ── Rows ── */}
      <div className="pf-rows">
        {rows.map((h) => {
          const isOpen = expanded[h.symbol];
          const qty = parseInt(sellQty[h.symbol]) || 1;
          const pct = Math.min(100, Math.max(0, ((h.price - h.stopLoss) / (h.takeProfit - h.stopLoss)) * 100));

          return (
            <div key={h.symbol} className={`pf-row ${isOpen ? "pf-row--open" : ""}`}>
              {/* Main row */}
              <div className="pf-row-main" onClick={() => setExpanded((p) => ({ ...p, [h.symbol]: !isOpen }))}>
                {/* Symbol */}
                <div className="pf-cell pf-cell--symbol">
                  <span className="pf-ticker">{h.symbol}</span>
                  <span className="pf-sector">{h.exchange || "NSE"}</span>
                </div>

                {/* Qty */}
                <div className="pf-cell">
                  <span className="pf-val">{h.quantity}</span>
                </div>

                {/* Avg */}
                <div className="pf-cell">
                  <span className="pf-val">₹{h.avgPrice.toFixed(2)}</span>
                </div>

                {/* LTP + sparkline */}
                <div className="pf-cell pf-cell--ltp">
                  <span className="pf-val">₹{h.price.toFixed(2)}</span>
                  <div className="pf-spark">
                    <Sparkline data={priceHistory[h.symbol] || []} />
                  </div>
                </div>

                {/* P/L */}
                <div className="pf-cell">
                  <span className={`pf-pl ${h.pl >= 0 ? "pf-pl--gain" : "pf-pl--loss"}`}>
                    {h.pl >= 0 ? "+" : ""}₹{h.pl.toFixed(2)}
                  </span>
                  <span className={`pf-pct ${h.pl >= 0 ? "pf-pct--gain" : "pf-pct--loss"}`}>
                    {h.percent >= 0 ? "+" : ""}{h.percent.toFixed(2)}%
                  </span>
                </div>

                {/* SL / TP */}
                <div className="pf-cell pf-cell--sltp">
                  <div className="pf-sltp-bar">
                    <div className="pf-sltp-fill" style={{ width: `${pct}%` }} />
                    <span className="pf-sltp-dot" style={{ left: `${pct}%` }} />
                  </div>
                  <div className="pf-sltp-labels">
                    <span className="pf-sl">₹{h.stopLoss.toFixed(0)}</span>
                    <span className="pf-tp">₹{h.takeProfit.toFixed(0)}</span>
                  </div>
                </div>

                {/* Expand toggle */}
                <div className="pf-cell pf-cell--actions">
                  <button
                    className="pf-expand-btn"
                    onClick={(e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [h.symbol]: !isOpen })); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Sell
                  </button>
                </div>
              </div>

              {/* Expanded sell panel */}
              {isOpen && (
                <div className="pf-sell-panel">
                  <div className="pf-sell-grid">

                    {/* Quantity selector */}
                    <div className="pf-sell-field pf-sell-field--qty">
                      <label>Sell Quantity <span className="pf-max-hint">max {h.quantity}</span></label>
                      <div className="pf-qty-control">
                        <button type="button" className="pf-qty-btn"
                          onClick={() => setSellQty((p) => ({ ...p, [h.symbol]: Math.max(1, (parseInt(p[h.symbol]) || 1) - 1) }))}>−</button>
                        <input
                          type="number" min="1" max={h.quantity}
                          className="pf-qty-input"
                          value={sellQty[h.symbol] || ""}
                          placeholder="1"
                          onChange={(e) => setSellQty((p) => ({ ...p, [h.symbol]: e.target.value }))}
                        />
                        <button type="button" className="pf-qty-btn"
                          onClick={() => setSellQty((p) => ({ ...p, [h.symbol]: Math.min(h.quantity, (parseInt(p[h.symbol]) || 1) + 1) }))}>+</button>
                        <button type="button" className="pf-qty-all"
                          onClick={() => setSellQty((p) => ({ ...p, [h.symbol]: h.quantity }))}>All</button>
                      </div>
                      {sellQty[h.symbol] > 0 && (
                        <div className="pf-sell-preview">
                          Selling {qty} × ₹{h.price.toFixed(2)} =&nbsp;
                          <strong>₹{(qty * h.price).toFixed(2)}</strong>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="pf-sell-field">
                      <label>Trade Notes</label>
                      <textarea
                        className="pf-textarea"
                        placeholder="Why are you selling? e.g. hit target, stop loss..."
                        value={noteInputs[h.symbol] || ""}
                        onChange={(e) => setNoteInputs((p) => ({ ...p, [h.symbol]: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    {/* Tags */}
                    <div className="pf-sell-field">
                      <label>Tags <span className="pf-hint">comma separated</span></label>
                      <input
                        type="text" className="pf-input"
                        placeholder="breakout, news, swing..."
                        value={tagInputs[h.symbol] || ""}
                        onChange={(e) => setTagInputs((p) => ({ ...p, [h.symbol]: e.target.value }))}
                      />
                    </div>

                    {/* Emotion + Rating row */}
                    <div className="pf-sell-field pf-sell-field--row">
                      <div className="pf-sell-subfield">
                        <label>Emotion</label>
                        <select className="pf-select"
                          value={emotionInputs[h.symbol] || ""}
                          onChange={(e) => setEmotionInputs((p) => ({ ...p, [h.symbol]: e.target.value }))}>
                          {emotions.map((em) => <option key={em.value} value={em.value}>{em.label}</option>)}
                        </select>
                      </div>
                      <div className="pf-sell-subfield">
                        <label>Trade Rating</label>
                        <div className="pf-stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button"
                              className={`pf-star ${(parseInt(ratingInputs[h.symbol]) || 0) >= star ? "pf-star--active" : ""}`}
                              onClick={() => setRatingInputs((p) => ({ ...p, [h.symbol]: star }))}>★</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sell button */}
                  <div className="pf-sell-footer">
                    <button
                      className={`pf-sell-btn ${selling[h.symbol] ? "pf-sell-btn--loading" : ""}`}
                      onClick={() => sellStock(h.symbol)}
                      disabled={selling[h.symbol]}
                    >
                      {selling[h.symbol] ? (
                        <><span className="pf-btn-spinner" /> Selling…</>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Sell {qty > 1 ? `${qty} shares` : "1 share"} of {h.symbol}
                        </>
                      )}
                    </button>
                    <button className="pf-cancel-btn" onClick={() => setExpanded((p) => ({ ...p, [h.symbol]: false }))}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Portfolio;
