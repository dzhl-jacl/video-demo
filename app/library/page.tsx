"use client";

import { useState } from "react";
import { ScriptPanel } from "@/components/ScriptPanel";
import { CopyBar } from "@/components/CopyBar";
import { scriptToMarkdown } from "@/lib/exporter";
import { useLibrary } from "@/lib/useLibrary";

export default function LibraryPage() {
  const { entries, restored, remove } = useLibrary();
  const [selected, setSelected] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  const picked = entries.filter((e) => selected.includes(e.id));
  const fmt = (ts: number) => new Date(ts).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

  if (!restored) {
    return <div className="grid min-h-screen place-items-center text-slate-500">加载中…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">脚本库</h1>
        <p className="mt-1 text-sm text-slate-400">
          归档生成过的脚本，可回看、导出，勾选两篇并排对比，看选题怎么迭代。
        </p>
      </header>

      {entries.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          还没有存档。去选题生产页生成脚本后，点「存入脚本库」即可归档。
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">存档 {entries.length}</h2>
              <button
                onClick={() => { setCompareMode((v) => !v); setSelected([]); }}
                className={`rounded-md px-2.5 py-1 text-[11px] ${compareMode ? "bg-accent/15 text-accent" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
              >
                {compareMode ? "退出对比" : "对比模式"}
              </button>
            </div>
            <div className="grid max-h-[72vh] gap-2 overflow-y-auto pr-1">
              {entries.map((e) => {
                const active = selected.includes(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() => toggle(e.id)}
                    className={`rounded-xl border p-3 text-left transition ${active ? "border-accent/40 bg-accent/10" : "border-white/5 bg-panel/40 hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-2">
                      {e.category && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">{e.category}</span>}
                      <span className="text-[10px] text-slate-600">{fmt(e.savedAt)}</span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-slate-200">{e.topicTitle}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="lg:col-span-2">
            {picked.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">
                {compareMode ? "勾选两篇脚本进行并排对比" : "点左侧任意一篇查看"}
              </p>
            ) : (
              <div className={`grid gap-4 ${picked.length === 2 ? "md:grid-cols-2" : ""}`}>
                {picked.map((e) => (
                  <div key={e.id} className="min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-slate-400">{fmt(e.savedAt)}</span>
                      <div className="flex gap-2">
                        <CopyBar getMarkdown={() => scriptToMarkdown(e.script)} filename={`${e.topicTitle.slice(0, 12)}.md`} />
                        <button onClick={() => { remove(e.id); setSelected((p) => p.filter((x) => x !== e.id)); }} className="rounded-md bg-rose-500/10 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20">删除</button>
                      </div>
                    </div>
                    <ScriptPanel script={e.script} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
