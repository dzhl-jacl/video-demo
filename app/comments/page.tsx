"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CommentInsight, CommentScope, CommentCategory, ApiResult } from "@/lib/types";

const CATEGORY_STYLE: Record<CommentCategory, string> = {
  纠错质疑: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  选题需求: "border-accent/30 bg-accent/10 text-accent",
  争议点: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  做得好: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  做得不好: "border-orange-500/30 bg-orange-500/10 text-orange-300",
};

const SCOPE_TABS: { id: CommentScope; label: string; desc: string }[] = [
  { id: "self", label: "自己评论区", desc: "复盘：纠错 / 夸赞 / 吐槽 / 催更" },
  { id: "competitor", label: "对标 UP 评论区", desc: "挖掘：选题需求 / 争议 / 差异化机会" },
];

export default function CommentsPage() {
  const router = useRouter();
  const [scope, setScope] = useState<CommentScope>("self");
  const [data, setData] = useState<CommentInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function analyze(s: CommentScope) {
    setScope(s);
    setLoading(true);
    setNotice(null);
    setData(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: s }),
      });
      const json: ApiResult<CommentInsight> = await res.json();
      setData(json.data);
      setNotice(json.message ?? null);
    } catch {
      setNotice("分析失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  // 「选题需求」一键成卡：把选题方向塞进 sessionStorage，跳到 studio 自动灌进产线
  function toStudio(idea: string) {
    try {
      sessionStorage.setItem("studio-seed-text", idea);
    } catch {
      // ignore
    }
    router.push("/studio");
  }

  const grouped = groupByCategory(data);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">评论区选题反哺</h1>
        <p className="mt-1 text-sm text-slate-400">
          把评论区的真实声音变成下一期的弹药：自己视频复盘纠错，对标视频挖掘选题机会。
        </p>
      </header>

      <div className="mb-5 grid gap-2 sm:grid-cols-2">
        {SCOPE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => analyze(t.id)}
            disabled={loading}
            className={`rounded-xl border p-4 text-left transition disabled:opacity-50 ${
              scope === t.id && data
                ? "border-accent/40 bg-accent/10"
                : "border-white/10 bg-panel/40 hover:border-white/20"
            }`}
          >
            <div className="text-sm font-semibold text-slate-100">{t.label}</div>
            <div className="mt-0.5 text-[11px] text-slate-500">{t.desc}</div>
          </button>
        ))}
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-white/10 bg-panel/40 px-3 py-2 text-xs text-slate-400">
          {notice}
        </div>
      )}

      {loading && (
        <p className="py-10 text-center text-sm text-slate-500">正在抓取并分析评论…</p>
      )}

      {!loading && !data && (
        <p className="py-10 text-center text-sm text-slate-500">
          选择上方一个评论区，开始分析。
        </p>
      )}

      {!loading && data && (
        <div className="space-y-5">
          <div className="rounded-xl border border-white/5 bg-panel/50 p-4">
            <div className="text-xs text-slate-500">
              {data.upName} · {data.videoTitle}
            </div>
            <p className="mt-1.5 text-sm text-slate-200">{data.summary}</p>
          </div>

          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded-md border px-2 py-0.5 text-xs ${CATEGORY_STYLE[cat]}`}>
                  {cat}
                </span>
                <span className="text-[11px] text-slate-600">{items.length} 条</span>
              </div>
              <div className="space-y-2">
                {items.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-panel/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed text-slate-200">{it.text}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        <span>赞 {it.likes}</span>
                        {it.topicIdea && <span className="text-accent">建议选题：{it.topicIdea}</span>}
                      </div>
                    </div>
                    {cat === "选题需求" && it.topicIdea && (
                      <button
                        onClick={() => toStudio(it.topicIdea!)}
                        className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-bg hover:bg-accent/90"
                      >
                        成卡 →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CATEGORY_ORDER: CommentCategory[] = [
  "选题需求",
  "纠错质疑",
  "争议点",
  "做得不好",
  "做得好",
];

function groupByCategory(data: CommentInsight | null): [CommentCategory, CommentInsight["items"]][] {
  if (!data) return [];
  return CATEGORY_ORDER.map((cat) => [cat, data.items.filter((i) => i.category === cat)] as [
    CommentCategory,
    CommentInsight["items"]
  ]).filter(([, items]) => items.length > 0);
}
