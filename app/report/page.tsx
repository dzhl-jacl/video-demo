"use client";

import { useState } from "react";
import { CopyBar } from "@/components/CopyBar";
import { reportToMarkdown, type ReportEntry } from "@/lib/exporter";
import { useLibrary } from "@/lib/useLibrary";

type Range = "today" | "week" | "all";

const RANGE_TABS: { id: Range; label: string }[] = [
  { id: "today", label: "今日" },
  { id: "week", label: "本周" },
  { id: "all", label: "全部" },
];

export default function ReportPage() {
  const { entries, restored } = useLibrary();
  const [range, setRange] = useState<Range>("week");

  const now = Date.now();
  const cutoff = range === "today" ? now - 86400000 : range === "week" ? now - 7 * 86400000 : 0;
  const filtered = entries.filter((e) => e.savedAt >= cutoff);

  const reportEntries: ReportEntry[] = filtered.map((e) => ({
    topicTitle: e.topicTitle,
    category: e.category,
    savedAt: e.savedAt,
    sections: e.script.sections.length,
  }));

  const title = `内容生产${range === "today" ? "日报" : range === "week" ? "周报" : "总报告"}`;

  const byCat = new Map<string, number>();
  reportEntries.forEach((e) => byCat.set(e.category || "未分类", (byCat.get(e.category || "未分类") ?? 0) + 1));

  if (!restored) {
    return <div className="grid min-h-screen place-items-center text-slate-500">加载中…</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">选题日报 / 周报</h1>
        <p className="mt-1 text-sm text-slate-400">
          把一段时间的选题与脚本产出汇总成可分享报告，一键复制发给团队。数据来自脚本库存档。
        </p>
      </header>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1.5">
          {RANGE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setRange(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${range === t.id ? "bg-accent/15 text-accent" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {reportEntries.length > 0 && (
          <CopyBar getMarkdown={() => reportToMarkdown(title, reportEntries)} filename={`${title}.md`} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="产出脚本" value={`${reportEntries.length} 篇`} />
        <Stat label="覆盖品类" value={`${byCat.size} 类`} />
        <Stat label="时间范围" value={RANGE_TABS.find((t) => t.id === range)!.label} />
      </div>

      {byCat.size > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {[...byCat.entries()].map(([c, n]) => (
            <span key={c} className="rounded-lg bg-white/5 px-3 py-1 text-xs text-slate-300">
              {c} <span className="text-accent">{n}</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-5">
        {reportEntries.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            这个时间范围还没有产出。去选题生产页生成脚本并「存入脚本库」后，这里会自动汇总。
          </p>
        ) : (
          <div className="space-y-2">
            {reportEntries.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-panel/40 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-slate-200">{e.topicTitle}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {e.category || "未分类"} · {e.sections} 段 · {new Date(e.savedAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-slate-600">#{i + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-panel/50 p-4">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-100">{value}</div>
    </div>
  );
}
