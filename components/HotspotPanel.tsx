"use client";

import { useRouter } from "next/navigation";
import type { HotspotAnalysis } from "@/lib/types";

function TagRow({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-[11px] text-slate-500">{title}</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {items.map((t, i) => (
          <span key={i} className="rounded bg-white/5 px-2 py-0.5 text-[11px] text-slate-300">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HotspotPanel({ analysis }: { analysis: HotspotAnalysis }) {
  const router = useRouter();

  function sendToStudio(category: string) {
    try {
      sessionStorage.setItem("studio-prefill-category", category);
    } catch {
      // ignore
    }
    router.push("/studio");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-white/5 bg-panel/60 p-4">
        <h3 className="text-sm font-semibold text-slate-200">爆款规律拆解</h3>
        <TagRow title="标题套路" items={analysis.titlePatterns} />
        <TagRow title="高播放选题角度" items={analysis.hotAngles} />
        <TagRow title="爆款共性" items={analysis.commonalities} />
        <div>
          <div className="text-[11px] text-slate-500">时长规律</div>
          <p className="mt-1 text-xs text-slate-300">{analysis.durationInsight}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-accent2/20 bg-accent2/5 p-4">
        <h3 className="text-sm font-semibold text-accent2">我们的差异化切入点</h3>
        {analysis.differentiation.map((d, i) => (
          <div key={i} className="rounded-lg border border-white/5 bg-panel/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-100">{d.idea}</p>
              <span className="shrink-0 rounded bg-accent/15 px-2 py-0.5 text-[11px] text-accent">
                {d.category}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">{d.reason}</p>
            <button
              onClick={() => sendToStudio(d.category)}
              className="mt-2 rounded-lg bg-accent2/15 px-2.5 py-1 text-[11px] text-accent2 hover:bg-accent2/25"
            >
              带入选题工作台 →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
