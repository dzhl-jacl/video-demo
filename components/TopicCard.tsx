import type { Topic } from "@/lib/types";

export function TopicCard({
  topic,
  selected,
  onSelect,
}: {
  topic: Topic;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition ${
        selected
          ? "border-accent bg-accent/10"
          : "border-white/5 bg-panel/60 hover:border-accent2/40"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-100">{topic.title}</h3>
        <span className="shrink-0 rounded-full bg-accent2/15 px-2 py-0.5 text-xs text-accent2">
          热度 {topic.heatScore}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {topic.category && (
          <span className="rounded bg-accent/15 px-2 py-0.5 text-[11px] text-accent">
            {topic.category}
          </span>
        )}
        {topic.reviewAngle && (
          <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-slate-200">
            {topic.reviewAngle}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">{topic.reason}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {topic.highlights.map((h, i) => (
          <span key={i} className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
            {h}
          </span>
        ))}
      </div>
      {topic.controversies.length > 0 && (
        <p className="mt-2 text-[11px] text-amber-400/80">需核实：{topic.controversies.join("、")}</p>
      )}
      <p className="mt-2 text-[11px] text-slate-500">受众：{topic.audience}</p>
    </button>
  );
}
