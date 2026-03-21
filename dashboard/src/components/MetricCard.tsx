import type { ReactNode } from "react";

interface Metric {
  label: string;
  value: string;
  delta?: number;
}

interface Props {
  platform: string;
  icon: ReactNode;
  iconColor: string;
  iconBg: string;
  metrics: Metric[];
  topPost?: string;
}

function DeltaBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return null;
  const positive = value >= 0;
  return (
    <span
      className={`text-xs font-medium ${
        positive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {positive ? "+" : ""}
      {value.toLocaleString()}
    </span>
  );
}

export function MetricCard({
  platform,
  icon,
  iconColor,
  iconBg,
  metrics,
  topPost,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Platform header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-base">{platform}</h3>
      </div>

      {/* Metrics */}
      <div className="px-5 pb-4 space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-baseline justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {m.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold">{m.value}</span>
              <DeltaBadge value={m.delta} />
            </div>
          </div>
        ))}
      </div>

      {/* Top post */}
      {topPost && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
            Top Post
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {topPost}
          </p>
        </div>
      )}
    </div>
  );
}
