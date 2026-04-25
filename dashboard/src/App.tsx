import { useState, useEffect } from "react";
import { useData } from "./useData";
import { SummaryCards } from "./components/SummaryCards";
import { FollowersSection } from "./components/FollowersSection";
import { EngagementSection } from "./components/EngagementSection";
import { PageViewsSection } from "./components/PageViewsSection";
import { PostPerformance } from "./components/PostPerformance";
import { TrendChart } from "./components/TrendChart";
import { ComparisonKPI } from "./components/ComparisonKPI";
import { ExpandableSection } from "./components/ExpandableSection";
import {
  TimePeriodSelector,
  type TimePeriod,
} from "./components/TimePeriodSelector";
import {
  groupByPeriod,
  getComparisonPair,
  formatPeriodLabel,
  shortPeriodLabel,
} from "./periodUtils";

function App() {
  const { loading, error, snapshots } = useData();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0077B5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error || snapshots.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error ?? "No snapshot data available."}
          </p>
        </div>
      </div>
    );
  }

  // Group snapshots by selected time period
  const grouped = groupByPeriod(snapshots, timePeriod);
  const comparison = getComparisonPair(snapshots, timePeriod);

  const currentSnapshot = comparison?.current ?? snapshots[snapshots.length - 1];
  const previousSnapshot = comparison?.previous ?? null;

  // Build chart data
  const followerTrend = grouped.map((g) => ({
    label: shortPeriodLabel(g.key, timePeriod),
    value: g.snapshot.linkedin.followers.total,
  }));

  const impressionTrend = grouped.map((g) => ({
    label: shortPeriodLabel(g.key, timePeriod),
    value: g.snapshot.linkedin.engagement.impressions,
  }));

  const engagementTrend = grouped.map((g) => ({
    label: shortPeriodLabel(g.key, timePeriod),
    value: g.snapshot.linkedin.engagement.engagement_rate,
  }));

  const pageViewTrend = grouped.map((g) => ({
    label: shortPeriodLabel(g.key, timePeriod),
    value: g.snapshot.linkedin.page_views.total,
  }));

  const currentPeriodLabel = grouped.length > 0
    ? formatPeriodLabel(grouped[grouped.length - 1].key, timePeriod)
    : "";

  const snapshotDate = new Date(currentSnapshot.date).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0077B5] flex items-center justify-center">
              <span className="text-white font-bold text-sm">DX</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">DEXLab</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                LinkedIn Analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <TimePeriodSelector
                selected={timePeriod}
                onChange={setTimePeriod}
              />
            </div>
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Mobile time period selector */}
        <div className="sm:hidden px-4 pb-3">
          <TimePeriodSelector selected={timePeriod} onChange={setTimePeriod} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Title */}
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-2xl font-bold">LinkedIn Overview</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentPeriodLabel} &middot; Latest snapshot: {snapshotDate}
              &middot; {snapshots.length} data point{snapshots.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Summary cards with comparison */}
        <SummaryCards snapshot={currentSnapshot} previous={previousSnapshot} />

        {/* Trend charts */}
        {grouped.length > 1 && (
          <ExpandableSection title="Trends" defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Follower Growth
                </p>
                <TrendChart data={followerTrend} color="#0077B5" type="line" height={140} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Impressions
                </p>
                <TrendChart data={impressionTrend} color="#0077B5" type="bar" height={140} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Engagement Rate (%)
                </p>
                <TrendChart
                  data={engagementTrend}
                  color="#10b981"
                  type="line"
                  height={140}
                  formatValue={(v) => `${v.toFixed(1)}%`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Page Views
                </p>
                <TrendChart data={pageViewTrend} color="#8b5cf6" type="bar" height={140} />
              </div>
            </div>
          </ExpandableSection>
        )}

        {/* Period comparison KPIs */}
        {previousSnapshot && (
          <ExpandableSection title={`Comparison — vs Previous ${timePeriod === "weekly" ? "Week" : timePeriod === "monthly" ? "Month" : timePeriod === "quarterly" ? "Quarter" : "Year"}`} defaultOpen>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ComparisonKPI
                label="Followers"
                current={currentSnapshot.linkedin.followers.total}
                previous={previousSnapshot.linkedin.followers.total}
              />
              <ComparisonKPI
                label="Impressions"
                current={currentSnapshot.linkedin.engagement.impressions}
                previous={previousSnapshot.linkedin.engagement.impressions}
              />
              <ComparisonKPI
                label="Engagement Rate"
                current={currentSnapshot.linkedin.engagement.engagement_rate}
                previous={previousSnapshot.linkedin.engagement.engagement_rate}
                format={(v) => v.toFixed(2)}
                suffix="%"
              />
              <ComparisonKPI
                label="Page Views"
                current={currentSnapshot.linkedin.page_views.total}
                previous={previousSnapshot.linkedin.page_views.total}
              />
              <ComparisonKPI
                label="Likes"
                current={currentSnapshot.linkedin.engagement.likes}
                previous={previousSnapshot.linkedin.engagement.likes}
              />
              <ComparisonKPI
                label="Comments"
                current={currentSnapshot.linkedin.engagement.comments}
                previous={previousSnapshot.linkedin.engagement.comments}
              />
              <ComparisonKPI
                label="Link Clicks"
                current={currentSnapshot.linkedin.engagement.clicks}
                previous={previousSnapshot.linkedin.engagement.clicks}
              />
              <ComparisonKPI
                label="Shares"
                current={currentSnapshot.linkedin.engagement.shares}
                previous={previousSnapshot.linkedin.engagement.shares}
              />
            </div>
          </ExpandableSection>
        )}

        {/* Expandable detail sections */}
        <div className="space-y-4">
          <FollowersSection followers={currentSnapshot.linkedin.followers} />

          <EngagementSection
            engagement={currentSnapshot.linkedin.engagement}
            previous={previousSnapshot?.linkedin.engagement ?? null}
          />

          <PageViewsSection
            pageViews={currentSnapshot.linkedin.page_views}
            previous={previousSnapshot?.linkedin.page_views ?? null}
          />

          <PostPerformance />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-400 dark:text-gray-600">
        DEXLab &middot; School of Business and Economics &middot; Maastricht
        University
      </footer>
    </div>
  );
}

export default App;
