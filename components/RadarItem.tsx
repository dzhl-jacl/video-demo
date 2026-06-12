"use client";

import { useState } from "react";
import { relativeTime } from "@/lib/time";
import { tagNews } from "@/lib/tagging";
import type { NewsItem, NewsAnalysis, ApiResult } from "@/lib/types";

const TAG_STYLE: Record<string, string> = {
  争议打假: "bg-rose-500/20 text-rose-300",
  技术硬核: "bg-accent/15 text-accent",
  新品首发: "bg-emerald-500/15 text-emerald-300",
  价格真香: "bg-amber-500/15 text-amber-300",
  前瞻爆料: "bg-violet-500/15 text-violet-300",
  横评盘点: "bg-sky-500/15 text-sky-300",
};

export function RadarItem({
  item,
  read,
  fav,
  onOpen,
  onToggleFav,
  onSendToStudio,
}: {
  item: NewsItem;
  read: boolean;
  fav: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
  onSendToStudio: () => void;
}) {
  const tags = tagNews(item.title, item.summary, item.publishedAt);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function analyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: item.title, summary: item.summary, source: item.source }),
      });
      const json: ApiResult<NewsAnalysis> = await res.json();
      setAnalysis(json.data);
    } catch {
      // ignore
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div
      className={`rounded-xl border p-3 transition ${
        tags.isControversial
          ? "border-rose-500/30 bg-rose-500/5"
          : read
          ? "border-white/5 bg-panel/30"
          : "border-accent/20 bg-panel/60"
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {!read && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
        {tags.isFresh && <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-orange-300">首发窗口</span>}
        {tags.valueTags.map((t) => (
          <span key={t} className={`rounded px-1.5 py-0.5 ${TAG_STYLE[t] ?? "bg-white/5 text-slate-300"}`}>
            {t}
          </span>
        ))}
        {tags.category !== "其他" && <span className="text-slate-500">{tags.category}</span>}
        <span className="ml-auto text-slate-500">{relativeTime(item.publishedAt)}</span>
      </div>

      <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={onOpen} className="mt-1.5 block">
        <h3 className={`line-clamp-2 text-sm font-medium ${read ? "text-slate-400" : "text-slate-100"}`}>
          {item.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{item.summary}</p>
      </a>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={onToggleFav}
          className={`rounded px-2 py-0.5 text-[11px] transition ${
            fav ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-slate-400 hover:text-slate-200"
          }`}
        >
          {fav ? "已加入待办" : "加入选题待办"}
        </button>
        <button onClick={analyze} disabled={analyzing} className="rounded px-2 py-0.5 text-[11px] text-accent hover:bg-accent/15 disabled:opacity-50">
          {analyzing ? "分析中…" : "AI 分析能不能做"}
        </button>
        <button onClick={onSendToStudio} className="rounded px-2 py-0.5 text-[11px] text-accent2 hover:bg-accent2/15">
          带入选题生产 →
        </button>
      </div>

      {analysis && (
        <div className="mt-2 space-y-1.5 rounded-lg border border-white/5 bg-black/20 p-2.5 text-[11px]">
          <p className="text-slate-200">{analysis.worthMaking}</p>
          <p className="text-slate-400">切入角度：{analysis.angles.join("、")}</p>
          <p className="text-amber-300/80">需核实：{analysis.verifyPoints.join("、")}</p>
          <p className="text-accent2">标题建议：{analysis.suggestedTitle}</p>
        </div>
      )}
    </div>
  );
}
