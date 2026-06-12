export interface ShareItem {
  label: string;
  value: number;
}

const COLORS = ["bg-accent", "bg-accent2", "bg-sky-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400"];

export function CategoryShare({ items }: { items: ShareItem[] }) {
  const total = Math.max(1, items.reduce((a, b) => a + b.value, 0));
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
        {items.map((item, i) => (
          <div
            key={i}
            className={COLORS[i % COLORS.length]}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className={`h-2.5 w-2.5 rounded-sm ${COLORS[i % COLORS.length]}`} />
            <span className="text-slate-300">{item.label}</span>
            <span className="text-slate-500">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
