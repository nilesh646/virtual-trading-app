const User = require("../models/User");
const { getStockPrice } = require("./marketService");

const autoSell = async (user, holding, sellPrice, reason) => {
  const quantity = holding.quantity;
  const pl = (sellPrice - holding.avgPrice) * quantity;

  user.balance += sellPrice * quantity;

  user.tradeHistory.push({
    type: "SELL",
    symbol: holding.symbol,
    quantity,
    price: sellPrice,
    pl,
    date: new Date(),
    note: reason
  });

  user.holdings = user.holdings.filter(h => h.symbol !== holding.symbol);

  await user.save();

  console.log(`AUTO SELL executed for ${holding.symbol} due to ${reason}`);
};

const startAutoTrader = () => {
  setInterval(async () => {
    try {
      const users = await User.find();

      for (const user of users) {
        for (const holding of user.holdings) {
          const stock = await getStockPrice(holding.symbol);
          if (!stock) continue;

          const price = stock.price;

          if (holding.stopLoss && price <= holding.stopLoss) {
            await autoSell(user, holding, price, "STOP LOSS");
          }

          else if (holding.takeProfit && price >= holding.takeProfit) {
            await autoSell(user, holding, price, "TAKE PROFIT");
          }
        }
      }
    } catch (err) {
      console.error("AutoTrader Error:", err.message);
    }
  }, 8000); // every 8 seconds
};

module.exports = { startAutoTrader };
