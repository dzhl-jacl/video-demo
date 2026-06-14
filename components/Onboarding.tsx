"use client";

import { useEffect, useState, useCallback } from "react";

const SEEN_KEY = "onboarding-tour-v1";

interface TourStep {
  selector: string;
  title: string;
  desc: string;
}

// 分步高亮引导：聚焦左侧导航的关键入口，逐步讲清怎么用。
const STEPS: TourStep[] = [
  {
    selector: '[data-tour="/workflow"]',
    title: "1 · 工作流编排中心",
    desc: "核心入口。把产品名或选题想法丢进去，一键跑通采集→选题→脚本→核查→分镜→口播→文案整条产线，也能点「用演示选题一键跑」。",
  },
  {
    selector: '[data-tour="/studio"]',
    title: "2 · 选题生产",
    desc: "三栏工作台：挑选题 → 生成脚本初稿 → 延伸核查/分镜/口播/文案，每个产物可复制或导出。",
  },
  {
    selector: '[data-tour="/radar"]',
    title: "3 · 资讯雷达",
    desc: "按选题价值刷一手资讯，争议、首发优先，看到好料一键加进选题待办。",
  },
  {
    selector: '[data-tour="/comments"]',
    title: "4 · 评论区反哺",
    desc: "抓评论自动分类，把观众的纠错和选题需求变成下一期的弹药。",
  },
  {
    selector: '[data-tour="/dashboard"]',
    title: "5 · 竞品看板",
    desc: "看对标 UP 的增长与爆款拆解，AI 反推差异化切入点。",
  },
];

type Phase = "ask" | "tour" | "done";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function Onboarding() {
  const [phase, setPhase] = useState<Phase>("done");
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setPhase("ask");
    } catch {
      // ignore
    }
  }, []);

  const finish = useCallback(() => {
    setPhase("done");
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  // 计算当前步目标元素的位置（高亮框）
  const measure = useCallback(() => {
    if (phase !== "tour") return;
    const el = document.querySelector(STEPS[stepIdx]?.selector);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    } else {
      setRect(null);
    }
  }, [phase, stepIdx]);

  useEffect(() => {
    measure();
    if (phase !== "tour") return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [phase, stepIdx, measure]);

  if (phase === "done") return null;

  // 第一阶段：问要不要教程
  if (phase === "ask") {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="animate-fade-in-up w-full max-w-md rounded-2xl border border-white/10 bg-panel p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-50">第一次来，要不要快速导览？</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            一套面向数码测评团队的 AI 内容生产工作流。花 30 秒带你认一下几个核心入口，也可以直接自己逛。
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => { setStepIdx(0); setPhase("tour"); }}
              className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-bg hover:bg-accent/90"
            >
              带我导览
            </button>
            <button
              onClick={finish}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10"
            >
              跳过，自己逛
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 第二阶段：分步高亮
  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;
  // 提示卡放在高亮框右侧；无目标（如移动端隐藏导航）则居中
  const cardStyle: React.CSSProperties = rect
    ? { top: Math.max(12, rect.top), left: rect.left + rect.width + 16 }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="fixed inset-0 z-[70]">
      {/* 暗色遮罩 */}
      <div className="absolute inset-0 bg-black/55" onClick={finish} />

      {/* 高亮框 */}
      {rect && (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-accent transition-all duration-300"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          }}
        />
      )}

      {/* 提示卡 */}
      <div
        className="animate-fade-in-up absolute w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-panel p-4 shadow-2xl"
        style={cardStyle}
      >
        <div className="text-sm font-semibold text-slate-100">{step.title}</div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{step.desc}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{stepIdx + 1} / {STEPS.length}</span>
          <div className="flex items-center gap-2">
            <button onClick={finish} className="text-[11px] text-slate-500 hover:text-slate-300">跳过</button>
            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx((i) => i - 1)}
                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10"
              >
                上一步
              </button>
            )}
            <button
              onClick={() => (isLast ? finish() : setStepIdx((i) => i + 1))}
              className="rounded-md bg-accent px-2.5 py-1 text-[11px] font-medium text-bg hover:bg-accent/90"
            >
              {isLast ? "完成" : "下一步"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
