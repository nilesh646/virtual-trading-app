const Sparkline = ({ data = [], width = 80, height = 30 }) => {
  if (!data.length) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);

  const points = data
    .map((price, i) => {
      const x = (i / (data.length - 1)) * width;
      const y =
        height -
        ((price - min) / (max - min || 1)) * height;

      return `${x},${y}`;
    })
    .join(" ");

  const isUp = data[data.length - 1] >= data[0];

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
