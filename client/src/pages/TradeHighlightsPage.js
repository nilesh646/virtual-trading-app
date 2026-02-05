import TradeExtremes from "../components/TradeExtremes";
import TradeLeaders from "../components/TradeLeaders";
import StreakStats from "../components/StreakStats";

const TradeHighlightsPage = () => {
  return (
    <>
      <div className="card"><TradeExtremes /></div>
      <div className="card"><TradeLeaders /></div>
      <div className="card"><StreakStats /></div>
    </>
  );
};

export default TradeHighlightsPage;