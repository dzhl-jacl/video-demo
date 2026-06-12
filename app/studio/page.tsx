"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NewsCard } from "@/components/NewsCard";
import { TopicCard } from "@/components/TopicCard";
import { ScriptWorkbench } from "@/components/ScriptWorkbench";
import { SeedInput } from "@/components/SeedInput";
import { StageBar } from "@/components/StageBar";
import { usePipeline } from "@/lib/usePipeline";
import { useReader } from "@/lib/useReader";
import { useLibrary } from "@/lib/useLibrary";
import { inferCategory } from "@/lib/category";
import type { NewsItem, Topic, VideoScript, ApiResult } from "@/lib/types";

export default function StudioPage() {
  const { state, update, reset, restored } = usePipeline();
  const reader = useReader();
  const library = useLibrary();
  const [loading, setLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [prefillCategory, setPrefillCategory] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cat = sessionStorage.getItem("studio-prefill-category");
      if (cat) {
        setPrefillCategory(cat);
        sessionStorage.removeItem("studio-prefill-category");
      }
      // 来自评论区「成卡」的选题方向：直接灌进产线
      const seedText = sessionStorage.getItem("studio-seed-text");
      if (seedText) {
        sessionStorage.removeItem("studio-seed-text");
        seedFromText(seedText);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 选题输入优先用资讯雷达收藏的资讯；没有收藏才用「直接采集」的资讯
  const topicInput = reader.favorites.length > 0 ? reader.favorites : state.news;

  async function loadNews() {
    setLoading("news");
    setNotice(null);
    try {
      const res = await fetch("/api/news");
      const json: ApiResult<NewsItem[]> = await res.json();
      // 重新采集时清空下游旧选题/脚本，避免显示与新资讯无关的过时选题
      update({
        news: json.data,
        stage: "news",
        topics: [],
        selectedTopic: null,
        script: null,
      });
      if (json.degraded) setNotice(json.message ?? "已使用兜底数据");
    } catch {
      setNotice("采集请求失败，请重试");
    } finally {
      setLoading(null);
    }
  }

  async function genTopics() {
    setLoading("topics");
    setNotice(null);
    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: topicInput, preferredCategory: prefillCategory ?? undefined }),
      });
      const json: ApiResult<Topic[]> = await res.json();
      update({ topics: json.data, stage: "topics" });
      if (json.degraded) setNotice(json.message ?? "已使用示例选题");
    } catch {
      setNotice("选题生成失败，请重试");
    } finally {
      setLoading(null);
    }
  }

  async function genScript(topic: Topic) {
    setLoading("script");
    setNotice(null);
    update({ selectedTopic: topic, script: null, factCheck: null, shotList: null, spoken: null, publishKit: null });
    try {
      const res = await fetch("/api/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const json: ApiResult<VideoScript> = await res.json();
      update({ script: json.data, stage: "script" });
      if (json.degraded) setNotice(json.message ?? "已使用示例脚本");
    } catch {
      setNotice("脚本生成失败，请重试");
    } finally {
      setLoading(null);
    }
  }

  // 「任意输入」杀招：把用户粘贴的产品名/通稿/想法封装成一条种子资讯，直接灌进产线。
  function seedFromText(text: string) {
    const seed: NewsItem = {
      id: `seed-${Date.now()}`,
      title: text.slice(0, 40),
      source: "手动输入",
      url: "",
      publishedAt: new Date().toISOString(),
      summary: text,
      category: inferCategory(text),
    };
    update({
      news: [seed],
      stage: "news",
      topics: [],
      selectedTopic: null,
      script: null,
      factCheck: null,
      shotList: null,
      spoken: null,
      publishKit: null,
    });
    reader.clearFavorites();
    setNotice("已把你的输入灌进产线，点「智能选题」开跑");
  }

  if (!restored) {
    return <div className="grid min-h-screen place-items-center text-slate-500">加载中…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">选题工作台</h1>
        <p className="mt-1 text-sm text-slate-400">
          多源资讯采集 → AI 聚类选题打分 → 一键生成带信源标注的脚本初稿
        </p>
        <div className="mt-4 flex items-center justify-between">
          <StageBar stage={state.stage} />
          <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300">
            重置
          </button>
        </div>
        {prefillCategory && (
          <div className="mt-3 rounded-lg border border-accent2/30 bg-accent2/10 px-3 py-2 text-xs text-accent2">
            已带入「{prefillCategory}」品类方向，生成选题时会重点关注。
          </div>
        )}
        {notice && (
          <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
            {notice}
          </div>
        )}
        <div className="mt-4">
          <SeedInput onSeed={seedFromText} loading={loading === "news"} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              选题待办
              {reader.favorites.length > 0 && (
                <span className="ml-1.5 text-xs text-slate-500">{reader.favorites.length}</span>
              )}
            </h2>
            <Link href="/radar" className="text-xs text-accent hover:text-accent/80">
              去资讯雷达挑 →
            </Link>
          </div>
          <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
            {reader.favorites.length > 0 ? (
              reader.favorites.map((n) => <NewsCard key={n.id} item={n} />)
            ) : state.news.length > 0 ? (
              state.news.map((n) => <NewsCard key={n.id} item={n} />)
            ) : (
              <div className="space-y-3 text-xs text-slate-500">
                <p>选题待办空着呢。去资讯雷达刷一刷，把值得做的料加入待办；或直接采集一批。</p>
                <button
                  onClick={loadNews}
                  disabled={loading === "news"}
                  className="rounded-lg bg-accent/15 px-3 py-1.5 text-accent hover:bg-accent/25 disabled:opacity-50"
                >
                  {loading === "news" ? "采集中…" : "直接采集资讯"}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">AI 选题</h2>
            <button
              onClick={genTopics}
              disabled={loading === "topics" || topicInput.length === 0}
              className="rounded-lg bg-accent2/15 px-3 py-1.5 text-xs text-accent2 hover:bg-accent2/25 disabled:opacity-50"
            >
              {loading === "topics" ? "分析中…" : "智能选题"}
            </button>
          </div>
          <div className="grid max-h-[70vh] gap-3 overflow-y-auto pr-1">
            {state.topics.length === 0 ? (
              <p className="text-xs text-slate-500">收藏或采集资讯后，生成选题</p>
            ) : (
              state.topics.map((t) => (
                <TopicCard
                  key={t.id}
                  topic={t}
                  selected={state.selectedTopic?.id === t.id}
                  onSelect={() => genScript(t)}
                />
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">脚本工作台</h2>
            {loading === "script" && <span className="text-xs text-slate-500">生成中…</span>}
          </div>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            {loading === "script" ? (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                <div className="flex items-center gap-2 text-xs text-accent">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
                  AI 正在撰写脚本初稿…
                </div>
              </div>
            ) : state.script ? (
              <ScriptWorkbench
                script={state.script}
                factCheck={state.factCheck}
                shotList={state.shotList}
                spoken={state.spoken}
                publishKit={state.publishKit}
                onResult={(patch) => update(patch)}
                onSaveToLibrary={() =>
                  state.script && library.save(state.script, state.selectedTopic?.category)
                }
              />
            ) : (
              <p className="text-xs text-slate-500">选择一个选题，一键生成脚本初稿</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
