import TradeLeaders from "../components/TradeLeaders";
import TradeExtremes from "../components/TradeExtremes";
import StreakStats from "../components/StreakStats";

const TradeHighlightsPage = () => (
  <>
    <div className="card"><TradeLeaders /></div>
    <div className="card"><TradeExtremes /></div>
    <div className="card"><StreakStats /></div>
  </>
);

export default TradeHighlightsPage;
