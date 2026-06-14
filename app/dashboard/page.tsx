"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { BarChart } from "@/components/dashboard/BarChart";
import { CategoryShare } from "@/components/dashboard/CategoryShare";
import { CompetitorCard } from "@/components/CompetitorCard";
import { HotspotPanel } from "@/components/HotspotPanel";
import { aggregateCategories, deriveInsights } from "@/lib/insight";
import { formatCount } from "@/lib/time";
import type { CompetitorStat, ApiResult, HotspotAnalysis } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<CompetitorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [hotspot, setHotspot] = useState<HotspotAnalysis | null>(null);
  const [hotspotLoading, setHotspotLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/bili/competitors");
        const json: ApiResult<CompetitorStat[]> = await res.json();
        if (!active) return;
        setStats(json.data);
        setDegraded(Boolean(json.degraded));
        if (json.degraded || json.message) setNotice(json.message ?? "已使用快照数据");
      } catch {
        if (active) {
          setNotice("数据加载失败");
          setDegraded(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    (async () => {
      try {
        const res = await fetch("/api/bili/hotspot", { method: "POST" });
        const json: ApiResult<HotspotAnalysis> = await res.json();
        if (active) setHotspot(json.data);
      } catch {
        // 忽略，UI 显示加载失败占位
      } finally {
        if (active) setHotspotLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const categories = aggregateCategories(stats);
  const insights = deriveInsights(stats);
  const playRanking = stats
    .map((s) => ({ label: s.name, value: s.maxPlay, highlight: s.name === "胜利文绉绉" }))
    .sort((a, b) => b.value - a.value);

  const totalFollower = stats.reduce((a, b) => a + b.follower, 0);
  const topUp = [...stats].sort((a, b) => b.maxPlay - a.maxPlay)[0];

  function sendToStudio(category: string) {
    try {
      sessionStorage.setItem("studio-prefill-category", category);
    } catch {
      // ignore
    }
    router.push("/studio");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">竞品数据看板</h1>
        <p className="mt-1 text-sm text-slate-400">
          追踪同类数码 UP 的增长与爆款，反推值得跟进的选题方向
        </p>
        {notice && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
              degraded
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-sky-500/25 bg-sky-500/10 text-sky-300"
            }`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${degraded ? "bg-amber-400" : "bg-sky-400"}`} />
            {notice}
          </div>
        )}
      </header>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="追踪 UP 数" value={String(stats.length)} sub="数码区对标账号" />
            <MetricCard label="合计粉丝" value={formatCount(totalFollower)} accent="violet" />
            <MetricCard
              label="最高爆款"
              value={topUp ? formatCount(topUp.maxPlay) : "-"}
              sub={topUp?.name}
            />
            <MetricCard label="热门品类" value={categories[0]?.label ?? "-"} sub="按播放加权" accent="violet" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-white/5 bg-panel/40 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-200">爆款播放排行</h2>
              <BarChart items={playRanking} />
            </section>
            <section className="rounded-xl border border-white/5 bg-panel/40 p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-200">热门品类分布</h2>
              <CategoryShare items={categories} />
            </section>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">对标 UP 概况</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {stats.map((s) => (
                <CompetitorCard key={s.mid} stat={s} />
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">
              爆款拆解与差异化
              <span className="ml-2 text-[11px] font-normal text-slate-500">AI 分析对标 UP 的爆款规律，找我们的切入点</span>
            </h2>
            {hotspotLoading ? (
              <div className="skeleton h-40" />
            ) : hotspot ? (
              <HotspotPanel analysis={hotspot} />
            ) : (
              <div className="rounded-xl border border-white/5 bg-panel/40 p-6 text-center text-xs text-slate-500">
                爆款分析加载失败
              </div>
            )}
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">选题反推建议</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {insights.map((ins, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-panel/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium text-slate-100">{ins.title}</h3>
                    <span className="shrink-0 rounded bg-accent/15 px-2 py-0.5 text-[11px] text-accent">
                      {ins.category}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{ins.reason}</p>
                  <button
                    onClick={() => sendToStudio(ins.category)}
                    className="mt-3 rounded-lg bg-accent2/15 px-3 py-1.5 text-xs text-accent2 hover:bg-accent2/25"
                  >
                    带入选题工作台 →
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-56" />
        <div className="skeleton h-56" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
      </div>
    </div>
  );
}
