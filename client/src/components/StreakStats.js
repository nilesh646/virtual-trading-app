import { useEffect, useState } from "react";
import api from "../api/axios";

const StreakStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/analytics/streaks");
        setStats(res.data);
      } catch (err) {
        console.error("Streak load failed", err);
      }
    };

    load();
  }, []);

  if (!stats) return <p>Loading streak stats...</p>;

  return (
    <div>
      <h3>Trading Streaks</h3>

      <p>🔥 Longest Win Streak: <strong>{stats.maxWinStreak}</strong></p>
      <p>❄️ Longest Loss Streak: <strong>{stats.maxLossStreak}</strong></p>

      {stats.currentType && (
        <p>
          📊 Current Streak:{" "}
          <span style={{ color: stats.currentType === "win" ? "#00c853" : "#ff5252" }}>
            {stats.currentStreak} {stats.currentType === "win" ? "Wins" : "Losses"}
          </span>
        </p>
      )}
    </div>
  );
};

export default StreakStats;
