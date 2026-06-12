import type { PublishKit } from "@/lib/types";

export function PublishPanel({ data }: { data: PublishKit }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/5 bg-panel/60 p-4">
        <span className="text-xs text-accent">标题候选</span>
        <ol className="mt-2 space-y-1.5">
          {data.titles.map((t, i) => (
            <li key={i} className="text-sm leading-relaxed text-slate-100">
              {i + 1}. {t}
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-xl border border-white/5 bg-panel/60 p-4">
        <span className="text-xs text-accent2">视频简介</span>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{data.description}</p>
      </div>
      <div className="rounded-xl border border-white/5 bg-panel/60 p-4">
        <span className="text-xs text-slate-400">话题标签</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {data.tags.map((t, i) => (
            <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
              #{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
