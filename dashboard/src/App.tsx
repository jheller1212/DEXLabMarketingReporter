import { useState, useEffect } from "react";
import { mockData, type MonthlyReport } from "./mockData";
import { SummaryBar } from "./components/SummaryBar";
import { MetricCard } from "./components/MetricCard";
import { MonthSelector } from "./components/MonthSelector";
import { BlogCard } from "./components/BlogCard";

function App() {
  const [selectedMonth, setSelectedMonth] = useState(
    mockData[mockData.length - 1].monthKey
  );
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

  const report: MonthlyReport =
    mockData.find((d) => d.monthKey === selectedMonth) ??
    mockData[mockData.length - 1];

  const prevReport: MonthlyReport | undefined = mockData.find(
    (d) =>
      d.monthKey ===
      (() => {
        const [y, m] = selectedMonth.split("-").map(Number);
        const prev =
          m === 1
            ? `${y - 1}-12`
            : `${y}-${String(m - 1).padStart(2, "0")}`;
        return prev;
      })()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">DX</span>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">DEXLab</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Marketing Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <MonthSelector
              months={mockData.map((d) => ({
                key: d.monthKey,
                label: d.month,
              }))}
              selected={selectedMonth}
              onChange={setSelectedMonth}
            />
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {dark ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Month title */}
        <div>
          <h2 className="text-2xl font-bold">{report.month}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monthly performance overview
          </p>
        </div>

        {/* Summary bar */}
        <SummaryBar report={report} prevReport={prevReport} />

        {/* Platform cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LinkedIn */}
          <MetricCard
            platform="LinkedIn"
            icon={
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            }
            iconColor="text-blue-600"
            iconBg="bg-blue-50 dark:bg-blue-950"
            metrics={[
              {
                label: "Followers",
                value: report.linkedin.followers.toLocaleString(),
                delta: report.linkedin.followerDelta,
              },
              {
                label: "Impressions",
                value: report.linkedin.impressions.toLocaleString(),
                delta: prevReport
                  ? report.linkedin.impressions -
                    prevReport.linkedin.impressions
                  : undefined,
              },
              {
                label: "Engagement Rate",
                value: `${report.linkedin.engagementRate.toFixed(1)}%`,
              },
            ]}
            topPost={report.linkedin.topPostTitle}
          />

          {/* Instagram */}
          <MetricCard
            platform="Instagram"
            icon={
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            }
            iconColor="text-pink-600"
            iconBg="bg-pink-50 dark:bg-pink-950"
            metrics={[
              {
                label: "Followers",
                value: report.instagram.followers.toLocaleString(),
                delta: report.instagram.followerDelta,
              },
              {
                label: "Reach",
                value: report.instagram.reach.toLocaleString(),
                delta: prevReport
                  ? report.instagram.reach - prevReport.instagram.reach
                  : undefined,
              },
              {
                label: "Avg Engagement",
                value: `${report.instagram.avgEngagementRate.toFixed(1)}%`,
              },
            ]}
            topPost={report.instagram.topPostCaption}
          />

          {/* Wix Website */}
          <MetricCard
            platform="Website"
            icon={
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            }
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50 dark:bg-emerald-950"
            metrics={[
              {
                label: "Unique Visitors",
                value: report.wix.uniqueVisitors.toLocaleString(),
                delta: prevReport
                  ? report.wix.uniqueVisitors - prevReport.wix.uniqueVisitors
                  : undefined,
              },
              {
                label: "Sessions",
                value: report.wix.sessions.toLocaleString(),
                delta: prevReport
                  ? report.wix.sessions - prevReport.wix.sessions
                  : undefined,
              },
              {
                label: "Top Page",
                value: report.wix.topPage,
              },
            ]}
          />
        </div>

        {/* Blog posts */}
        <BlogCard posts={report.wix.blogPosts} />
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
