import { useEffect, useState } from "react";
import api from "../api/axios";

const AIWeeklyReport = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const res = await api.get("/api/analytics/weekly-report");
        setReport(res.data);
      } catch (err) {
        console.error("Weekly report load failed", err);
      }
    };

    loadReport();
  }, []);

  if (!report) return <p>Generating AI weekly report...</p>;

  return (
    <div className="card">
      <h3>AI Weekly Trading Report</h3>

      <p>Total Trades: <b>{report.totalTrades}</b></p>
      <p>Wins: <b>{report.wins}</b> | Losses: <b>{report.losses}</b></p>
      <p>Win Rate: <b>{report.winRate}%</b></p>
      <p>Total P/L: <b style={{ color: report.totalPL >= 0 ? "#00c853" : "#ff5252" }}>
        ₹{report.totalPL}
      </b></p>

      <p>Biggest Win: ₹{report.biggestWin}</p>
      <p>Biggest Loss: ₹{report.biggestLoss}</p>
      <p>Overtrading Days: {report.overtradeDays}</p>

      <hr />
      <p style={{ fontStyle: "italic", color: "#555" }}>
        🤖 AI Insight: {report.feedback}
      </p>
    </div>
  );
};

export default AIWeeklyReport;
