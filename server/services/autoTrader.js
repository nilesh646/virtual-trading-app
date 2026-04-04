const User = require("../models/User");
const { getStockPrice } = require("./marketService");

const runAutoTrader = async () => {
  console.log("🤖 AutoTrader running...");

  try {
    const users = await User.find({});

    // 🔥 LOOP THROUGH USERS (IMPORTANT)
    for (const user of users) {

      // ================= AUTO SELL (SL / TP) =================
      for (const holding of user.holdings || []) {
        const { symbol, quantity, avgPrice } = holding;

        const latestTrade = [...user.tradeHistory]
          .reverse()
          .find(t => t.symbol === symbol && t.type === "BUY");

        if (!latestTrade) continue;

        const { stopLoss, takeProfit } = latestTrade;

        const stock = await getStockPrice(symbol);
        if (!stock) continue;

        const currentPrice = stock.price;

        let shouldSell = false;
        let reason = "";

        if (stopLoss && currentPrice <= stopLoss) {
          shouldSell = true;
          reason = "Stop Loss Hit";
        }

        if (takeProfit && currentPrice >= takeProfit) {
          shouldSell = true;
          reason = "Take Profit Hit";
        }

        if (!shouldSell) continue;

        const proceeds = currentPrice * quantity;
        const pl = (currentPrice - avgPrice) * quantity;

        user.balance += proceeds;

        user.holdings = user.holdings.filter(h => h.symbol !== symbol);

        user.tradeHistory.push({
          type: "SELL",
          symbol,
          quantity,
          price: currentPrice,
          pl,
          reason,
          date: new Date()
        });

        console.log(`📉 Auto SOLD ${symbol} (${reason})`);
      }

      // ================= LIMIT ORDER EXECUTION =================
      for (const order of user.orders || []) {
        if (order.status !== "PENDING") continue;

        const stock = await getStockPrice(order.symbol);
        if (!stock) continue;

        if (stock.price <= order.limitPrice) {
          const totalCost = stock.price * order.quantity;

          if (user.balance < totalCost) continue;

          user.balance -= totalCost;

          user.holdings.push({
            symbol: order.symbol,
            quantity: order.quantity,
            avgPrice: stock.price
          });

          order.status = "EXECUTED";

          user.tradeHistory.push({
            type: "BUY",
            symbol: order.symbol,
            quantity: order.quantity,
            price: stock.price,
            date: new Date()
          });

          console.log(`✅ Limit BUY executed: ${order.symbol}`);
        }
      }

      // 🔥 SAVE USER AFTER ALL OPERATIONS
      await user.save();
    }

  } catch (err) {
    console.error("AutoTrader Error:", err.message);
  }
};

module.exports = { runAutoTrader };