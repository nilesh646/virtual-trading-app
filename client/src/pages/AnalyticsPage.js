import Analytics from "../components/Analytics";
import EquityCurveChart from "../components/EquityCurveChart";
import DailyPLChart from "../components/DailyPLChart";
import DrawdownCard from "../components/DrawdownCard";
import SharpeCard from "../components/SharpeCard";
import SortinoCard from "../components/SortinoCard";

const AnalyticsPage = ({ equityCurve }) => (
  <>
    <div className="card"><Analytics /></div>
    <div className="card"><EquityCurveChart data={equityCurve} /></div>
    <div className="card"><DailyPLChart /></div>
    <div className="card"><DrawdownCard /></div>
    <div className="card"><SharpeCard /></div>
    <div className="card"><SortinoCard /></div>
  </>
);

export default AnalyticsPage;
