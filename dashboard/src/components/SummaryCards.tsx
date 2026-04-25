import type { Snapshot } from "../types";

interface Props {
  snapshot: Snapshot;
  previous: Snapshot | null;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return "+100%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

function DeltaBadge({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) return null;
  const diff = current - previous;
  const positive = diff >= 0;
  return (
    <div className="flex items-center gap-1 mt-1">
      <span
        className={`text-xs font-medium ${
          positive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {positive ? "+" : ""}{fmt(diff)}
      </span>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        ({pctChange(current, previous)})
      </span>
    </div>
  );
}

export function SummaryCards({ snapshot, previous }: Props) {
  const { followers, engagement, page_views } = snapshot.linkedin;

  const cards = [
    {
      label: "Followers",
      value: fmt(followers.total),
      current: followers.total,
      previous: previous?.linkedin.followers.total ?? null,
      color: "border-t-[#0077B5]",
    },
    {
      label: "Impressions",
      value: fmt(engagement.impressions),
      current: engagement.impressions,
      previous: previous?.linkedin.engagement.impressions ?? null,
      color: "border-t-[#0077B5]",
    },
    {
      label: "Engagement Rate",
      value: `${engagement.engagement_rate.toFixed(2)}%`,
      current: engagement.engagement_rate,
      previous: previous?.linkedin.engagement.engagement_rate ?? null,
      color: "border-t-[#0077B5]",
    },
    {
      label: "Page Views",
      value: fmt(page_views.total),
      current: page_views.total,
      previous: previous?.linkedin.page_views.total ?? null,
      color: "border-t-[#0077B5]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 border-t-4 ${card.color} p-4`}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {card.label}
          </p>
          <p className="text-2xl font-bold mt-1">{card.value}</p>
          <DeltaBadge current={card.current} previous={card.previous} />
        </div>
      ))}
    </div>
  );
}
