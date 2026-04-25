import type { EngagementData } from "../types";
import { ExpandableSection } from "./ExpandableSection";

interface Props {
  engagement: EngagementData;
  previous: EngagementData | null;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function Delta({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null) return null;
  const diff = current - previous;
  const positive = diff >= 0;
  return (
    <span
      className={`text-xs font-medium ${
        positive
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {positive ? "+" : ""}{fmt(diff)}
    </span>
  );
}

export function EngagementSection({ engagement, previous }: Props) {
  const metrics = [
    { label: "Impressions", value: engagement.impressions, prev: previous?.impressions ?? null },
    { label: "Unique Impressions", value: engagement.unique_impressions, prev: previous?.unique_impressions ?? null },
    { label: "Likes", value: engagement.likes, prev: previous?.likes ?? null },
    { label: "Comments", value: engagement.comments, prev: previous?.comments ?? null },
    { label: "Shares", value: engagement.shares, prev: previous?.shares ?? null },
    { label: "Clicks", value: engagement.clicks, prev: previous?.clicks ?? null },
  ];

  // Calculate total engagements for the visual breakdown
  const totalEngagements = engagement.likes + engagement.comments + engagement.shares + engagement.clicks;
  const breakdown = [
    { label: "Clicks", value: engagement.clicks, color: "bg-[#0077B5]" },
    { label: "Likes", value: engagement.likes, color: "bg-[#00A0DC]" },
    { label: "Comments", value: engagement.comments, color: "bg-[#86CAEA]" },
    { label: "Shares", value: engagement.shares, color: "bg-[#B8E2F2]" },
  ];

  return (
    <ExpandableSection
      title="Engagement"
      subtitle={`${engagement.engagement_rate.toFixed(2)}% engagement rate`}
      defaultOpen
      icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      }
    >
      <div className="pt-4 space-y-6">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.label}</p>
              <p className="text-lg font-semibold mt-0.5">{fmt(m.value)}</p>
              <Delta current={m.value} previous={m.prev} />
            </div>
          ))}
        </div>

        {/* Engagement rate highlight */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-medium">Engagement Rate</span>
            <span className="text-2xl font-bold text-[#0077B5]">{engagement.engagement_rate.toFixed(2)}%</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0077B5] rounded-full transition-all"
              style={{ width: `${Math.min(engagement.engagement_rate, 100)}%` }}
            />
          </div>
        </div>

        {/* Engagement breakdown bar */}
        <div>
          <p className="text-sm font-medium mb-2">
            Engagement Breakdown
            <span className="text-gray-400 dark:text-gray-500 font-normal ml-2">
              {fmt(totalEngagements)} total
            </span>
          </p>
          <div className="h-6 flex rounded-full overflow-hidden">
            {breakdown.map((b) => {
              const pct = totalEngagements > 0 ? (b.value / totalEngagements) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={b.label}
                  className={`${b.color} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${b.label}: ${fmt(b.value)} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-2">
            {breakdown.map((b) => (
              <div key={b.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                {b.label} ({fmt(b.value)})
              </div>
            ))}
          </div>
        </div>
      </div>
    </ExpandableSection>
  );
}
