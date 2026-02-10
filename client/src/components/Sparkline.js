const Sparkline = ({ data = [], width = 80, height = 30 }) => {

  // ✅ Remove invalid values (VERY IMPORTANT)
  const safeData = data.filter(
    v => typeof v === "number" && !isNaN(v)
  );

  // nothing valid to draw
  if (safeData.length < 2) return null;

  const max = Math.max(...safeData);
  const min = Math.min(...safeData);

  // avoid divide-by-zero when all prices equal
  const range = max - min === 0 ? 1 : max - min;

  const points = safeData
    .map((price, i) => {
      const x = (i / (safeData.length - 1)) * width;

      const y =
        height -
        ((price - min) / range) * height;

      // extra safety guard
      if (isNaN(x) || isNaN(y)) return null;

      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");

  if (!points) return null;

  const isUp =
    safeData[safeData.length - 1] >= safeData[0];

  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke={isUp ? "#00c853" : "#ff5252"}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};

export default Sparkline;
