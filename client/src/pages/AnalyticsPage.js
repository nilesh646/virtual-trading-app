import EquityCurveChart from "../components/EquityCurveChart";
import DailyPLChart from "../components/DailyPLChart";
import DrawdownCard from "../components/DrawdownCard";
import SharpeCard from "../components/SharpeCard";
import SortinoCard from "../components/SortinoCard";
import ProfitFactorCard from "../components/ProfitFactorCard";
import ExpectancyCard from "../components/ExpectancyCard";

const AnalyticsPage = ({ equityCurve }) => {
  return (
    <>
      <div className="card">
        <EquityCurveChart data={equityCurve} />
      </div>

      <div className="card">
        <DailyPLChart />
      </div>

      <div className="card"><DrawdownCard /></div>
      <div className="card"><SharpeCard /></div>
      <div className="card"><SortinoCard /></div>
      <div className="card"><ProfitFactorCard /></div>
      <div className="card"><ExpectancyCard /></div>
    </>
  );
};

export default AnalyticsPage;
