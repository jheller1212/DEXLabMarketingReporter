interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  color?: string;
  height?: number;
  type?: "line" | "bar";
  formatValue?: (v: number) => string;
}

export function TrendChart({
  data,
  color = "#0077B5",
  height = 120,
  type = "line",
  formatValue = (v) => v.toLocaleString(),
}: Props) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const padding = { top: 8, bottom: 24, left: 8, right: 8 };
  const chartWidth = 100; // percentage-based via viewBox
  const chartHeight = height;
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const scaleX = (i: number) =>
    padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth;
  const scaleY = (v: number) =>
    padding.top + plotHeight - ((v - min) / range) * plotHeight;

  if (type === "bar") {
    const barWidth = plotWidth / data.length * 0.7;
    const barGap = plotWidth / data.length;
    return (
      <div className="w-full">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full"
          preserveAspectRatio="none"
          style={{ height }}
        >
          {data.map((d, i) => {
            const barH = ((d.value - min) / range) * plotHeight * 0.9 + plotHeight * 0.1;
            const x = padding.left + i * barGap + (barGap - barWidth) / 2;
            const y = padding.top + plotHeight - barH;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={color}
                  opacity={0.8}
                  rx={1}
                />
                <title>{`${d.label}: ${formatValue(d.value)}`}</title>
              </g>
            );
          })}
          {/* X labels */}
          {data.map((d, i) => (
            <text
              key={`label-${i}`}
              x={padding.left + i * barGap + barGap / 2}
              y={chartHeight - 2}
              textAnchor="middle"
              className="fill-gray-400 dark:fill-gray-500"
              style={{ fontSize: "3.5px" }}
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>
    );
  }

  // Line chart
  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`);
  const linePath = `M${points.join("L")}`;
  const areaPath = `${linePath}L${scaleX(data.length - 1)},${padding.top + plotHeight}L${scaleX(0)},${padding.top + plotHeight}Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        preserveAspectRatio="none"
        style={{ height }}
      >
        {/* Gradient fill */}
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={0.8} strokeLinejoin="round" />
        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={scaleX(i)} cy={scaleY(d.value)} r={1.2} fill={color} />
            <title>{`${d.label}: ${formatValue(d.value)}`}</title>
          </g>
        ))}
        {/* X labels */}
        {data.filter((_, i) => data.length <= 8 || i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d) => {
          const i = data.indexOf(d);
          return (
            <text
              key={`label-${i}`}
              x={scaleX(i)}
              y={chartHeight - 2}
              textAnchor="middle"
              className="fill-gray-400 dark:fill-gray-500"
              style={{ fontSize: "3.5px" }}
            >
              {d.label}
            </text>
          );
        })}
        {/* Min/Max labels */}
        <text
          x={chartWidth - padding.right}
          y={scaleY(max) - 2}
          textAnchor="end"
          className="fill-gray-400 dark:fill-gray-500"
          style={{ fontSize: "3px" }}
        >
          {formatValue(max)}
        </text>
        <text
          x={chartWidth - padding.right}
          y={scaleY(min) + 5}
          textAnchor="end"
          className="fill-gray-400 dark:fill-gray-500"
          style={{ fontSize: "3px" }}
        >
          {formatValue(min)}
        </text>
      </svg>
    </div>
  );
}
