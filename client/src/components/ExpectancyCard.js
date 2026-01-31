import { useEffect, useState } from "react";
import api from "../api/axios";

const ExpectancyCard = () => {
  const [expectancy, setExpectancy] = useState(null);

  useEffect(() => {
    const loadExpectancy = async () => {
      try {
        const res = await api.get("/api/analytics/expectancy");
        setExpectancy(res.data.expectancy);
      } catch (err) {
        console.error("Expectancy load failed", err);
      }
    };

    loadExpectancy();
  }, []);

  const getColor = () => {
    const val = Number(expectancy);
    if (val > 0) return "#00c853";
    if (val < 0) return "#ff5252";
    return "#ffab00";
  };

  return (
    <div className="card">
      <h3>Expectancy / Trade</h3>
      {expectancy !== null ? (
        <p style={{ color: getColor(), fontWeight: "bold" }}>
          ₹ {expectancy}
        </p>
      ) : (
        <p>Loading Expectancy...</p>
      )}
    </div>
  );
};

export default ExpectancyCard;
