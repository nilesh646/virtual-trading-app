import AIInsights from "../components/AIInsights";
import AIMistakes from "../components/AIMistakes";
import AITradeScores from "../components/AITradeScores";
import AIWeeklyReport from "../components/AIWeeklyReport";

const AIPage = () => {
  return (
    <>
      <div className="card"><AIInsights /></div>
      <div className="card"><AIMistakes /></div>
      <div className="card"><AITradeScores /></div>
      <div className="card"><AIWeeklyReport /></div>
    </>
  );
};

export default AIPage;
