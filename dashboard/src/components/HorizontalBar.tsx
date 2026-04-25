interface BarItem {
  label: string;
  value: number;
}

interface Props {
  items: BarItem[];
  maxItems?: number;
  color?: string;
}

export function HorizontalBar({ items, maxItems = 10, color = "bg-[#0077B5]" }: Props) {
  const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, maxItems);
  const max = sorted[0]?.value ?? 1;

  return (
    <div className="space-y-2">
      {sorted.map((item) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between text-sm mb-0.5">
              <span className="text-gray-600 dark:text-gray-300 truncate mr-2">{item.label}</span>
              <span className="font-medium tabular-nums shrink-0">{item.value.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
