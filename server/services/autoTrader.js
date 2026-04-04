const User = require("../models/User");
const { getStockPrice } = require("./marketService");

const runAutoTrader = async () => {
  console.log("🤖 AutoTrader running...");

  try {
    const users = await User.find({ "holdings.0": { $exists: true } });

    for (const user of users) {
      for (const holding of user.holdings) {
        const { symbol, quantity, avgPrice } = holding;

        const latestTrade = [...user.tradeHistory]
          .reverse()
          .find(t => t.symbol === symbol && t.type === "BUY");

        if (!latestTrade) continue;

        const { stopLoss, takeProfit } = latestTrade;

        if (!stopLoss && !takeProfit) continue;

        const stock = await getStockPrice(symbol);
        if (!stock) continue;

        const currentPrice = stock.price;

        let shouldSell = false;
        let reason = "";

        if (stopLoss && currentPrice <= stopLoss) {
          reason = "Stop Loss Hit";
        }

        if (takeProfit && currentPrice >= takeProfit) {
          reason = "Take Profit Hit";
        }

        if (currentPrice > avgPrice * 1.05) {
          holding.stopLoss = currentPrice * 0.97;
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

        console.log(`📉 Auto SOLD ${symbol} for user ${user._id} (${reason})`);
      }

      await user.save();
    }

    for (const order of user.orders || []) {
      if (order.status !== "PENDING") continue;

      const stock = await getStockPrice(order.symbol);

      if (stock.price <= order.limitPrice) {
        // execute buy
        user.balance -= stock.price * order.quantity;

        user.holdings.push({
          symbol: order.symbol,
          quantity: order.quantity,
          avgPrice: stock.price
        });

        order.status = "EXECUTED";

        console.log("✅ Limit order executed:", order.symbol);
      }
    }
  } catch (err) {
    console.error("AutoTrader Error:", err.message);
  }

};

module.exports = { runAutoTrader };
