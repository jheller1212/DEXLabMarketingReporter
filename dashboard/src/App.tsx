import { useState, useEffect } from "react";
import { useData } from "./useData";
import { SummaryCards } from "./components/SummaryCards";
import { FollowersSection } from "./components/FollowersSection";
import { EngagementSection } from "./components/EngagementSection";
import { PageViewsSection } from "./components/PageViewsSection";
import { PostPerformance } from "./components/PostPerformance";
import { TimePeriodSelector, type TimePeriod } from "./components/TimePeriodSelector";

function App() {
  const { loading, error, snapshots, latest } = useData();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("monthly");
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

  // With a single snapshot we just show the latest data.
  // When more snapshots accumulate, the time period selector will filter them.
  const currentSnapshot = latest ?? snapshots[snapshots.length - 1] ?? null;

  // Find previous snapshot for delta comparisons (if available)
  const previousSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  // Format snapshot date
  const snapshotDate = currentSnapshot
    ? new Date(currentSnapshot.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0077B5] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !currentSnapshot) {
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
              <TimePeriodSelector selected={timePeriod} onChange={setTimePeriod} />
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
              Snapshot from {snapshotDate}
            </p>
          </div>
          {snapshots.length === 1 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full">
              1 snapshot — trend data will appear as more snapshots accumulate
            </span>
          )}
        </div>

        {/* Summary cards */}
        <SummaryCards snapshot={currentSnapshot} previous={previousSnapshot} />

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
        DEXLab &middot; School of Business and Economics &middot; Maastricht University
      </footer>
    </div>
  );
}

export default App;
