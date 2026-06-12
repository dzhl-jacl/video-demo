import type { ShotList } from "@/lib/types";

export function ShotListPanel({ data }: { data: ShotList }) {
  return (
    <div className="space-y-3">
      {data.shots.map((sh, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-panel/60 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-accent2/15 px-2 py-0.5 text-[11px] text-accent2">
              {sh.scene}
            </span>
          </div>
          <dl className="mt-2 space-y-1.5 text-xs">
            <div className="flex gap-2">
              <dt className="w-12 shrink-0 text-slate-500">画面</dt>
              <dd className="text-slate-200">{sh.visual}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-12 shrink-0 text-slate-500">字幕</dt>
              <dd className="text-slate-200">{sh.subtitle}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-12 shrink-0 text-slate-500">B-roll</dt>
              <dd className="text-slate-400">{sh.broll}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
