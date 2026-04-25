import type { PageViewData } from "../types";
import { ExpandableSection } from "./ExpandableSection";

interface Props {
  pageViews: PageViewData;
  previous: PageViewData | null;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

export function PageViewsSection({ pageViews, previous }: Props) {
  const desktopPct = pageViews.total > 0 ? (pageViews.desktop / pageViews.total) * 100 : 0;
  const mobilePct = pageViews.total > 0 ? (pageViews.mobile / pageViews.total) * 100 : 0;

  const sections = [
    { label: "Overview", value: pageViews.overview, prev: previous?.overview ?? null },
    { label: "About", value: pageViews.about, prev: previous?.about ?? null },
    { label: "Careers", value: pageViews.careers, prev: previous?.careers ?? null },
    { label: "Jobs", value: pageViews.jobs, prev: previous?.jobs ?? null },
    { label: "People", value: pageViews.people, prev: previous?.people ?? null },
  ];

  const maxSection = Math.max(...sections.map((s) => s.value), 1);

  return (
    <ExpandableSection
      title="Page Views"
      subtitle={`${fmt(pageViews.total)} total views`}
      icon={
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      }
    >
      <div className="pt-4 space-y-6">
        {/* Desktop vs Mobile */}
        <div>
          <p className="text-sm font-medium mb-3">Device Breakdown</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <svg className="w-6 h-6 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-bold">{fmt(pageViews.desktop)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Desktop ({desktopPct.toFixed(1)}%)</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 text-center">
              <svg className="w-6 h-6 mx-auto text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-bold">{fmt(pageViews.mobile)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mobile ({mobilePct.toFixed(1)}%)</p>
            </div>
          </div>
          {/* Stacked bar */}
          <div className="h-3 flex rounded-full overflow-hidden mt-3">
            <div className="bg-[#0077B5] transition-all" style={{ width: `${desktopPct}%` }} />
            <div className="bg-[#86CAEA] transition-all" style={{ width: `${mobilePct}%` }} />
          </div>
          <div className="flex gap-4 mt-1.5">
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0077B5]" /> Desktop
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#86CAEA]" /> Mobile
            </span>
          </div>
        </div>

        {/* By section */}
        <div>
          <p className="text-sm font-medium mb-3">By Page Section</p>
          <div className="space-y-2">
            {sections.map((s) => {
              const pct = (s.value / maxSection) * 100;
              return (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-sm mb-0.5">
                    <span className="text-gray-600 dark:text-gray-300">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium tabular-nums">{fmt(s.value)}</span>
                      {s.prev !== null && (
                        <span
                          className={`text-xs ${
                            s.value - s.prev >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {s.value - s.prev >= 0 ? "+" : ""}{fmt(s.value - s.prev)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0077B5] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ExpandableSection>
  );
}
