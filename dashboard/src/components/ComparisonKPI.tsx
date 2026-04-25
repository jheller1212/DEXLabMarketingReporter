interface Props {
  label: string;
  current: number;
  previous: number | null;
  format?: (v: number) => string;
  suffix?: string;
}

export function ComparisonKPI({
  label,
  current,
  previous,
  format = (v) => v.toLocaleString(),
  suffix = "",
}: Props) {
  const diff = previous !== null ? current - previous : null;
  const pctChange = previous !== null && previous !== 0
    ? ((current - previous) / previous) * 100
    : null;
  const isPositive = diff !== null && diff >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-xl font-bold">
        {format(current)}{suffix}
      </p>
      {diff !== null && (
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${
              isPositive
                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
            }`}
          >
            {isPositive ? "↑" : "↓"} {format(Math.abs(diff))}{suffix}
          </span>
          {pctChange !== null && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              ({isPositive ? "+" : ""}{pctChange.toFixed(1)}%)
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500">
            vs prev period
          </span>
        </div>
      )}
    </div>
  );
}
