"use client";

import { SeedInput } from "@/components/SeedInput";
import { inferCategory } from "@/lib/category";
import { usePipeline } from "@/lib/usePipeline";
import {
  useWorkflowRun,
  type NodeId,
  type NodeStatus,
  type WorkflowArtifacts,
} from "@/lib/useWorkflowRun";
import type { NewsItem, Topic, VideoScript, ApiResult } from "@/lib/types";

interface FlowNode {
  id: NodeId;
  name: string;
  emoji: string;
  desc: string;
}

// 运行视图按「数据真实依赖」排序：采集→选题→脚本→核查→分镜→口播→文案。
const FLOW: FlowNode[] = [
  { id: "collect", name: "采集", emoji: "📡", desc: "多源资讯 / 你的输入" },
  { id: "topic", name: "选题", emoji: "🎯", desc: "聚类打分出选题卡" },
  { id: "script", name: "脚本", emoji: "✍️", desc: "带信源的脚本初稿" },
  { id: "verify", name: "核查", emoji: "🔍", desc: "逐条事实核查纠错" },
  { id: "shot", name: "分镜", emoji: "🎬", desc: "可拍摄分镜表" },
  { id: "spoken", name: "口播", emoji: "🎙️", desc: "口语化念稿" },
  { id: "copy", name: "文案", emoji: "📢", desc: "标题/简介/标签" },
];

const STATUS_STYLE: Record<NodeStatus, string> = {
  idle: "border-white/10 bg-panel/40 text-slate-500",
  running: "border-accent/60 bg-accent/10 text-accent animate-pulse",
  done: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  degraded: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function WorkflowPage() {
  const { update } = usePipeline();
  const { run, restored, markNode, addLog, setArtifacts, setSeedText, resetRun, clearRun } =
    useWorkflowRun();
  const { status, log, artifacts, seedText } = run;
  const running = Object.values(status).some((s) => s === "running");

  async function post<T>(api: string, body: unknown): Promise<ApiResult<T>> {
    const res = await fetch(api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function runAll(seed?: string) {
    if (running) return;
    resetRun(seed ?? null);

    const local: WorkflowArtifacts = {};
    // 同步清空 pipeline 下游，避免「去选题工作台」还显示上一次的旧数据
    update({
      news: [], topics: [], selectedTopic: null, script: null,
      factCheck: null, shotList: null, spoken: null, publishKit: null, stage: "news",
    });
    try {
      // 采集
      markNode("collect", "running");
      await sleep(400);
      if (seed) {
        local.news = [{
          id: `seed-${Date.now()}`,
          title: seed.slice(0, 40),
          source: "手动输入",
          url: "",
          publishedAt: new Date().toISOString(),
          summary: seed,
          category: inferCategory(seed),
        }];
        addLog(`采集 Agent：已接收你的输入「${seed.slice(0, 20)}…」`);
      } else {
        const res = await fetch("/api/news", { method: "GET" });
        const r: ApiResult<NewsItem[]> = await res.json();
        local.news = r.data;
        addLog(`采集 Agent：拿到 ${r.data.length} 条资讯${r.degraded ? "（兜底）" : ""}`);
      }
      markNode("collect", "done");
      update({ news: local.news ?? [], stage: "news" });

      // 选题
      markNode("topic", "running");
      const rt = await post<Topic[]>("/api/topics", { news: local.news });
      local.topic = rt.data[0];
      setArtifacts({ ...local });
      update({ topics: rt.data, selectedTopic: rt.data[0] ?? null, stage: "topics" });
      addLog(`选题 Agent：${rt.degraded ? "降级示例" : "AI"} 产出「${local.topic?.title?.slice(0, 24)}…」`);
      markNode("topic", rt.degraded ? "degraded" : "done");

      // 脚本
      markNode("script", "running");
      const rs = await post<VideoScript>("/api/script", { topic: local.topic });
      local.script = rs.data;
      setArtifacts({ ...local });
      update({ script: rs.data, stage: "script" });
      addLog(`脚本 Agent：${rs.degraded ? "降级示例" : "AI"} 生成 ${rs.data.sections.length} 段脚本`);
      markNode("script", rs.degraded ? "degraded" : "done");

      // 核查 / 分镜 / 口播 / 文案：都依赖脚本
      const downstream: { id: NodeId; api: string; key: keyof WorkflowArtifacts; label: string }[] = [
        { id: "verify", api: "/api/verify", key: "factCheck", label: "核查" },
        { id: "shot", api: "/api/shotlist", key: "shotList", label: "分镜" },
        { id: "spoken", api: "/api/spoken", key: "spoken", label: "口播" },
        { id: "copy", api: "/api/publish", key: "publishKit", label: "文案" },
      ];
      for (const d of downstream) {
        markNode(d.id, "running");
        const r = await post<unknown>(d.api, { script: local.script });
        (local as Record<string, unknown>)[d.key] = r.data;
        setArtifacts({ ...local });
        update({ [d.key]: r.data });
        addLog(`${d.label} Agent：${r.degraded ? "降级示例" : "AI"} 完成`);
        markNode(d.id, r.degraded ? "degraded" : "done");
      }
      addLog("产线跑通，全部产物已就绪。");
    } catch {
      addLog("某节点请求失败，已停在当前步（演示不崩）。");
    }
  }

  if (!restored) {
    return <div className="grid min-h-screen place-items-center text-slate-500">加载中…</div>;
  }

  const hasRun = log.length > 0 || Object.values(status).some((s) => s !== "idle");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">工作流编排中心</h1>
        <p className="mt-1 text-sm text-slate-400">
          把编辑日常的「找选题 → 查资料 → 写脚本 → 配后期」拆成一串可编排的 Agent。把你手头的料丢进来，整条产线一键跑通。
        </p>
      </header>

      {/* 主入口：贴料灌进产线（最贴合真实使用，结果最可控） */}
      <div className="mb-4">
        <SeedInput
          onSeed={(t) => { setSeedText(t); runAll(t); }}
          loading={running}
          demoSeed="vivo X300 Pro 长焦影像值不值得买"
        />
      </div>

      {/* 次要入口：自动抓真实资讯（结果随机，作为没料时的快速体验） */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setSeedText(null); runAll(); }}
          disabled={running}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-40"
        >
          {running ? "产线运行中…" : "或：自动抓资讯跑一遍"}
        </button>
        <span className="text-[11px] text-slate-500">
          自动抓的是实时资讯，命中内容随机，建议优先用上面贴料更可控
        </span>
        {hasRun && !running && (
          <button
            onClick={clearRun}
            className="ml-auto text-[11px] text-slate-500 hover:text-slate-300"
          >
            清空本次运行
          </button>
        )}
        {seedText && (
          <span className="w-full text-[11px] text-slate-500">当前种子：{seedText.slice(0, 40)}…</span>
        )}
      </div>

      <div className="flex flex-wrap items-stretch gap-2">
        {FLOW.map((node, i) => (
          <div key={node.id} className="flex items-stretch gap-2">
            <div className={`w-36 rounded-xl border p-3 transition ${STATUS_STYLE[status[node.id]]}`}>
              <div className="flex items-center justify-between">
                <span className="text-lg">{node.emoji}</span>
                <span className="text-[10px] uppercase tracking-wider">
                  {status[node.id] === "running" ? "运行中" :
                   status[node.id] === "done" ? "完成" :
                   status[node.id] === "degraded" ? "降级" : "待运行"}
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-100">{node.name} Agent</div>
              <div className="mt-0.5 text-[11px] text-slate-400">{node.desc}</div>
            </div>
            {i < FLOW.length - 1 && (
              <div className="flex items-center text-slate-600">→</div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-panel/40 p-4">
          <h2 className="text-sm font-semibold text-slate-200">运行日志</h2>
          <div className="mt-2 space-y-1 text-xs text-slate-400">
            {log.length === 0 ? (
              <p className="text-slate-600">把你的输入灌进产线，或点「自动抓资讯跑一遍」，看数据在 Agent 间流动。</p>
            ) : (
              log.map((l, i) => <p key={i}>· {l}</p>)
            )}
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-panel/40 p-4">
          <h2 className="text-sm font-semibold text-slate-200">最终产物速览</h2>
          <div className="mt-2 space-y-2 text-xs">
            {artifacts.topic && (
              <p className="text-slate-300">🎯 选题：{artifacts.topic.title}</p>
            )}
            {artifacts.script && (
              <p className="text-slate-300">✍️ 脚本：{artifacts.script.sections.length} 段 + 钩子 + 结尾</p>
            )}
            {artifacts.factCheck && (
              <p className="text-slate-300">🔍 核查：{artifacts.factCheck.items.length} 条事实声明已标注</p>
            )}
            {artifacts.shotList && (
              <p className="text-slate-300">🎬 分镜：{artifacts.shotList.shots.length} 个镜头</p>
            )}
            {artifacts.publishKit && (
              <p className="text-slate-300">📢 文案：{artifacts.publishKit.titles.length} 个标题候选</p>
            )}
            {!artifacts.topic && <p className="text-slate-600">产物会在产线跑动时逐步出现。</p>}
            {artifacts.script && (
              <a href="/studio" className="mt-2 inline-block text-accent hover:text-accent/80">
                去选题生产页查看完整产物与导出 →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
