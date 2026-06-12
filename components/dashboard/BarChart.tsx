import { formatCount } from "@/lib/time";

export interface BarItem {
  label: string;
  value: number;
  highlight?: boolean;
}

export function BarChart({ items }: { items: BarItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs">
            <span className="text-slate-300">{item.label}</span>
            <span className="text-slate-400">{formatCount(item.value)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full ${item.highlight ? "bg-accent" : "bg-accent2/70"}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
