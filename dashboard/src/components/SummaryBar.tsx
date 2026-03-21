import type { MonthlyReport } from "../mockData";

interface Props {
  report: MonthlyReport;
  prevReport?: MonthlyReport;
}

function DeltaBadge({ value }: { value?: number }) {
  if (value === undefined || value === null) return null;
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full ${
        positive
          ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950"
          : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950"
      }`}
    >
      {positive ? "+" : ""}
      {value.toLocaleString()}
    </span>
  );
}

export function SummaryBar({ report, prevReport }: Props) {
  const items = [
    {
      label: "Total Social Followers",
      value: (
        report.linkedin.followers + report.instagram.followers
      ).toLocaleString(),
      delta:
        report.linkedin.followerDelta + report.instagram.followerDelta,
    },
    {
      label: "LinkedIn Impressions",
      value: report.linkedin.impressions.toLocaleString(),
      delta: prevReport
        ? report.linkedin.impressions - prevReport.linkedin.impressions
        : undefined,
    },
    {
      label: "Instagram Reach",
      value: report.instagram.reach.toLocaleString(),
      delta: prevReport
        ? report.instagram.reach - prevReport.instagram.reach
        : undefined,
    },
    {
      label: "Website Visitors",
      value: report.wix.uniqueVisitors.toLocaleString(),
      delta: prevReport
        ? report.wix.uniqueVisitors - prevReport.wix.uniqueVisitors
        : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {item.label}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{item.value}</span>
            <DeltaBadge value={item.delta} />
          </div>
        </div>
      ))}
    </div>
  );
}
