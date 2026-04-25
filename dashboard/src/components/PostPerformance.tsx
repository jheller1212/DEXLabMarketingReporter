export function PostPerformance() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0077B5]/10 dark:bg-[#0077B5]/20 text-[#0077B5] flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="font-semibold text-base">Post Performance</h3>
      </div>
      <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Coming Soon</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
            Requires LinkedIn Marketing API approval. Individual post metrics will appear here once enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
