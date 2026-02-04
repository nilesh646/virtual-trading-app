import StrategyLeaderboard from "../components/StrategyLeaderboard";
import StrategyStats from "../components/StrategyStats";
import StrategyPerformance from "../components/StrategyPerformance";
import StrategyEquityCurves from "../components/StrategyEquityCurves";
import StrategyBreakdown from "../components/StrategyBreakdown";

const StrategyPage = () => (
  <>
    <div className="card"><StrategyLeaderboard /></div>
    <div className="card"><StrategyStats /></div>
    <div className="card"><StrategyPerformance /></div>
    <div className="card"><StrategyEquityCurves /></div>
    <div className="card"><StrategyBreakdown /></div>
  </>
);

export default StrategyPage;
