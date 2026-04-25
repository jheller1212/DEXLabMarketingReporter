export type TimePeriod = "weekly" | "monthly" | "quarterly" | "yearly";

interface Props {
  selected: TimePeriod;
  onChange: (period: TimePeriod) => void;
}

const periods: { key: TimePeriod; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly", label: "Yearly" },
];

export function TimePeriodSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {periods.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
            selected === p.key
              ? "bg-white dark:bg-gray-700 shadow-sm font-medium text-gray-900 dark:text-gray-100"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
