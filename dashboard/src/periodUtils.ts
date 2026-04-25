import type { Snapshot } from "./types";
import type { TimePeriod } from "./components/TimePeriodSelector";

/** Get the period key for a date string based on time period */
function getPeriodKey(dateStr: string, period: TimePeriod): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth();
  const weekNum = getISOWeek(d);

  switch (period) {
    case "weekly":
      return `${year}-W${String(weekNum).padStart(2, "0")}`;
    case "monthly":
      return `${year}-${String(month + 1).padStart(2, "0")}`;
    case "quarterly":
      return `${year}-Q${Math.floor(month / 3) + 1}`;
    case "yearly":
      return `${year}`;
  }
}

function getISOWeek(d: Date): number {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

/** Format a period key for display */
export function formatPeriodLabel(key: string, period: TimePeriod): string {
  switch (period) {
    case "weekly":
      return key; // e.g., "2026-W12"
    case "monthly": {
      const [y, m] = key.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${months[parseInt(m) - 1]} ${y}`;
    }
    case "quarterly":
      return key; // e.g., "2026-Q1"
    case "yearly":
      return key;
  }
}

/** Short label for chart x-axis */
export function shortPeriodLabel(key: string, period: TimePeriod): string {
  switch (period) {
    case "weekly": {
      const parts = key.split("-W");
      return `W${parts[1]}`;
    }
    case "monthly": {
      const [, m] = key.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months[parseInt(m) - 1];
    }
    case "quarterly":
      return key.split("-")[1]; // "Q1"
    case "yearly":
      return key;
  }
}

/** Group snapshots by period, taking the latest snapshot per period */
export function groupByPeriod(
  snapshots: Snapshot[],
  period: TimePeriod
): { key: string; snapshot: Snapshot }[] {
  const groups = new Map<string, Snapshot>();

  for (const snap of snapshots) {
    const key = getPeriodKey(snap.date, period);
    // Keep the latest snapshot per period
    groups.set(key, snap);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, snapshot]) => ({ key, snapshot }));
}

/** Get current and previous period snapshots for comparison */
export function getComparisonPair(
  snapshots: Snapshot[],
  period: TimePeriod
): { current: Snapshot; previous: Snapshot | null } | null {
  const grouped = groupByPeriod(snapshots, period);
  if (grouped.length === 0) return null;

  const current = grouped[grouped.length - 1].snapshot;
  const previous = grouped.length > 1 ? grouped[grouped.length - 2].snapshot : null;

  return { current, previous };
}
