"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RadarItem } from "@/components/RadarItem";
import { CardListSkeleton } from "@/components/Skeleton";
import { useReader } from "@/lib/useReader";
import { tagNews, VALUE_TAGS, type ValueTag } from "@/lib/tagging";
import type { NewsItem, ApiResult } from "@/lib/types";

const CATEGORIES = ["全部", "手机", "电脑", "相机", "手表", "眼镜", "汽车"];

export default function RadarPage() {
  const router = useRouter();
  const reader = useReader();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [valueTag, setValueTag] = useState<ValueTag | "全部">("全部");
  const [category, setCategory] = useState("全部");
  const [keyword, setKeyword] = useState("");
  const [freshOnly, setFreshOnly] = useState(false);
  const [unreadFirst, setUnreadFirst] = useState(true);

  async function load() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/news?mode=reader");
      const json: ApiResult<NewsItem[]> = await res.json();
      setNews(json.data);
      if (json.degraded) setNotice(json.message ?? "已使用兜底数据");
    } catch {
      setNotice("资讯加载失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // 预计算每条的标签，避免重复计算
  const tagged = useMemo(
    () => news.map((n) => ({ item: n, tags: tagNews(n.title, n.summary, n.publishedAt) })),
    [news]
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    let list = tagged.filter(({ item, tags }) => {
      if (valueTag !== "全部" && !tags.valueTags.includes(valueTag)) return false;
      if (category !== "全部" && tags.category !== category) return false;
      if (freshOnly && !tags.isFresh) return false;
      if (kw && !(item.title + item.summary).toLowerCase().includes(kw)) return false;
      return true;
    });
    if (unreadFirst) {
      list = [...list].sort(
        (a, b) => Number(reader.isRead(a.item.id)) - Number(reader.isRead(b.item.id))
      );
    }
    return list;
  }, [tagged, valueTag, category, keyword, freshOnly, unreadFirst, reader]);

  function sendToStudio(item: NewsItem) {
    reader.toggleFavorite(item);
    const cat = tagNews(item.title, item.summary, item.publishedAt).category;
    if (cat !== "其他") {
      try {
        sessionStorage.setItem("studio-prefill-category", cat);
      } catch {
        // ignore
      }
    }
    router.push("/studio");
  }

  // 各价值标签的数量统计，帮成员一眼看到哪类料多
  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    tagged.forEach(({ tags }) => tags.valueTags.forEach((t) => (map[t] = (map[t] ?? 0) + 1)));
    return map;
  }, [tagged]);

  const unreadCount = filtered.filter(({ item }) => !reader.isRead(item.id)).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-50">资讯雷达</h1>
            <p className="mt-1 text-sm text-slate-400">
              按选题价值刷资讯，争议和首发优先 · 攒成选题待办
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg bg-accent/15 px-3 py-1.5 text-xs text-accent hover:bg-accent/25 disabled:opacity-50"
          >
            {loading ? "刷新中…" : "刷新"}
          </button>
        </div>
        {notice && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            {notice}
          </div>
        )}
      </header>

      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setValueTag("全部")}
            className={`rounded-full px-3 py-1 text-xs transition ${
              valueTag === "全部" ? "bg-accent/20 text-accent" : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            全部
          </button>
          {VALUE_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setValueTag(t)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                valueTag === t ? "bg-accent/20 text-accent" : "bg-white/5 text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
              {tagCounts[t] ? <span className="ml-1 text-[10px] opacity-60">{tagCounts[t]}</span> : null}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-white/10 bg-panel px-2 py-1.5 text-xs text-slate-300"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "全部" ? "全部品类" : c}
              </option>
            ))}
          </select>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索关键词…"
            className="flex-1 rounded-lg border border-white/10 bg-panel px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600"
          />
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            <input type="checkbox" checked={freshOnly} onChange={(e) => setFreshOnly(e.target.checked)} />
            仅看首发窗口
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-400">
            <input type="checkbox" checked={unreadFirst} onChange={(e) => setUnreadFirst(e.target.checked)} />
            未读优先
          </label>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>共 {filtered.length} 条 · 未读 {unreadCount}</span>
          <span>选题待办 {reader.favorites.length}</span>
          {reader.favorites.length > 0 && (
            <button onClick={reader.clearFavorites} className="text-slate-500 hover:text-slate-300">
              清空待办
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <CardListSkeleton count={6} className="grid gap-3 md:grid-cols-2" />
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center py-16 text-sm text-slate-500">没有符合条件的资讯</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(({ item }) => (
            <RadarItem
              key={item.id}
              item={item}
              read={reader.isRead(item.id)}
              fav={reader.isFav(item.id)}
              onOpen={() => reader.markRead(item.id)}
              onToggleFav={() => reader.toggleFavorite(item)}
              onSendToStudio={() => sendToStudio(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
