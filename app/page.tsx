"use client";

import Link from "next/link";

const SELLING_POINTS = [
  { num: "7", unit: "个 Agent", label: "采集→选题→脚本→核查→分镜→口播→文案，一条龙串跑" },
  { num: "10", unit: "分钟", label: "把找选题、查资料、写脚本初稿压到十分钟级" },
  { num: "100%", unit: "不空屏", label: "真实抓取 + 真实 AI，任一环失败自动降级兜底" },
];

const FEATURES = [
  { emoji: "🧩", title: "工作流编排中心", desc: "贴一条产品名或选题想法，整条 Agent 产线一键跑通，逐节点点亮状态。", href: "/workflow" },
  { emoji: "✍️", title: "选题生产", desc: "选题待办 → AI 选题打分 → 脚本初稿，再延伸核查/分镜/口播/文案，全可导出。", href: "/studio" },
  { emoji: "📡", title: "资讯雷达", desc: "多源资讯按选题价值刷，争议、首发优先，攒成选题待办。", href: "/radar" },
  { emoji: "💬", title: "评论区反哺", desc: "抓评论自动分纠错/选题需求/争议/好评/差评，需求一键成卡。", href: "/comments" },
  { emoji: "📊", title: "竞品数据看板", desc: "对标 UP 的增长与爆款拆解，AI 反推差异化切入点。", href: "/dashboard" },
  { emoji: "📋", title: "横评表生成", desc: "输入几款产品，AI 生成结构化对比表骨架，标注需实测项。", href: "/compare" },
];

const FLOW = ["采集", "选题", "脚本", "核查", "分镜", "口播", "文案"];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* 背景光晕 */}
      <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl animate-float-glow" />
      <div className="pointer-events-none absolute -left-20 top-40 h-80 w-80 rounded-full bg-accent2/10 blur-3xl animate-float-glow" style={{ animationDelay: "2s" }} />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center">
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            面向数码测评团队的 AI 内容生产工作流
          </div>

          <h1 className="animate-fade-in-up mx-auto mt-5 max-w-3xl text-4xl font-bold leading-tight text-slate-50 sm:text-5xl" style={{ animationDelay: "0.08s" }}>
            把编辑每天的
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">找选题 · 查资料 · 写脚本初稿</span>
            <br className="hidden sm:block" />
            压进 10 分钟
          </h1>

          <p className="animate-fade-in-up mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base" style={{ animationDelay: "0.16s" }}>
            多源资讯实时采集，AI 聚类去重 + 选题价值打分，一键生成带信源标注的脚本初稿，再延伸到核查、分镜、口播、发布文案。整条产线拆成可编排的 Agent，全程真实数据、真实 AI。
          </p>

          <div className="animate-fade-in-up mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "0.24s" }}>
            <Link href="/workflow" className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-bg transition hover:bg-accent/90">
              ▶ 立即体验工作流
            </Link>
            <Link href="/studio" className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-200 transition hover:bg-white/10">
              进选题生产
            </Link>
            <Link href="/about" className="rounded-lg px-6 py-3 text-sm text-slate-400 transition hover:text-slate-200">
              关于作者 →
            </Link>
          </div>
        </div>

        {/* 卖点 */}
        <div className="animate-fade-in-up mt-16 grid gap-4 sm:grid-cols-3" style={{ animationDelay: "0.32s" }}>
          {SELLING_POINTS.map((p) => (
            <div key={p.unit} className="rounded-xl border border-white/5 bg-panel/40 p-5 text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-3xl font-bold text-transparent">{p.num}</span>
                <span className="text-xs text-slate-400">{p.unit}</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{p.label}</p>
            </div>
          ))}
        </div>

        {/* 产线流程 */}
        <div className="mt-16">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-slate-500">一条龙 Agent 产线</h2>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {FLOW.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-lg border border-white/10 bg-panel/50 px-3 py-1.5 text-xs text-slate-200">{step}</span>
                {i < FLOW.length - 1 && <span className="text-slate-600">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* 功能卡片 */}
        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold text-slate-50">这个平台能做什么</h2>
          <p className="mt-2 text-center text-sm text-slate-400">点任意一个，直接进去体验</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="group rounded-2xl border border-white/5 bg-panel/40 p-5 transition hover:border-accent/30 hover:bg-panel/70"
              >
                <div className="text-2xl">{f.emoji}</div>
                <h3 className="mt-3 text-base font-semibold text-slate-100">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{f.desc}</p>
                <div className="mt-3 text-xs text-accent opacity-0 transition group-hover:opacity-100">进入 →</div>
              </Link>
            ))}
          </div>
        </div>

        {/* 底部 CTA */}
        <div className="mt-16 rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 to-accent2/10 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-50">10 分钟，跑通一条完整内容产线</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            不用装环境，打开就能用。把你手头的产品名或选题想法丢进去，看 AI 一条龙产出。
          </p>
          <Link href="/workflow" className="mt-5 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-bg transition hover:bg-accent/90">
            ▶ 现在开始
          </Link>
        </div>
      </div>
    </div>
  );
}
