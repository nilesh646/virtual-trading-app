import StrategyStats from "../components/StrategyStats";
import StrategyPerformance from "../components/StrategyPerformance";
import StrategyEquityCurves from "../components/StrategyEquityCurves";
import StrategyLeaderboard from "../components/StrategyLeaderboard";

const StrategyPage = () => {
  return (
    <>
      <div className="card"><StrategyStats /></div>
      <div className="card"><StrategyPerformance /></div>
      <div className="card"><StrategyEquityCurves /></div>
      <div className="card"><StrategyLeaderboard /></div>
    </>
  );
};

export default StrategyPage;
