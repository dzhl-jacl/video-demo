"use client";

import { useState } from "react";
import { SeedInput } from "@/components/SeedInput";
import { inferCategory } from "@/lib/category";
import { usePipeline } from "@/lib/usePipeline";
import type {
  NewsItem,
  Topic,
  VideoScript,
  FactCheck,
  ShotList,
  SpokenScript,
  PublishKit,
  ApiResult,
} from "@/lib/types";

type NodeId = "collect" | "topic" | "script" | "verify" | "shot" | "spoken" | "copy";
type NodeStatus = "idle" | "running" | "done" | "degraded";

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

interface Artifacts {
  news?: NewsItem[];
  topic?: Topic;
  script?: VideoScript;
  factCheck?: FactCheck;
  shotList?: ShotList;
  spoken?: SpokenScript;
  publishKit?: PublishKit;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function WorkflowPage() {
  const { update } = usePipeline();
  const [status, setStatus] = useState<Record<NodeId, NodeStatus>>({
    collect: "idle",
    topic: "idle",
    script: "idle",
    verify: "idle",
    shot: "idle",
    spoken: "idle",
    copy: "idle",
  });
  const [artifacts, setArtifacts] = useState<Artifacts>({});
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [seedText, setSeedText] = useState<string | null>(null);

  function mark(id: NodeId, s: NodeStatus) {
    setStatus((prev) => ({ ...prev, [id]: s }));
  }
  function addLog(line: string) {
    setLog((prev) => [...prev, line]);
  }

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
    setRunning(true);
    setLog([]);
    setArtifacts({});
    setStatus({
      collect: "idle", topic: "idle", script: "idle",
      verify: "idle", shot: "idle", spoken: "idle", copy: "idle",
    });

    const local: Artifacts = {};
    // 同步清空 pipeline 下游，避免「去选题工作台」还显示上一次的旧数据
    update({
      news: [], topics: [], selectedTopic: null, script: null,
      factCheck: null, shotList: null, spoken: null, publishKit: null, stage: "news",
    });
    try {
      // 采集
      mark("collect", "running");
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
        const r = await post<NewsItem[]>("/api/news", {});
        local.news = r.data;
        addLog(`采集 Agent：拿到 ${r.data.length} 条资讯${r.degraded ? "（兜底）" : ""}`);
      }
      mark("collect", "done");
      update({ news: local.news ?? [], stage: "news" });

      // 选题
      mark("topic", "running");
      const rt = await post<Topic[]>("/api/topics", { news: local.news });
      local.topic = rt.data[0];
      setArtifacts({ ...local });
      update({ topics: rt.data, selectedTopic: rt.data[0] ?? null, stage: "topics" });
      addLog(`选题 Agent：${rt.degraded ? "降级示例" : "AI"} 产出「${local.topic?.title?.slice(0, 24)}…」`);
      mark("topic", rt.degraded ? "degraded" : "done");

      // 脚本
      mark("script", "running");
      const rs = await post<VideoScript>("/api/script", { topic: local.topic });
      local.script = rs.data;
      setArtifacts({ ...local });
      update({ script: rs.data, stage: "script" });
      addLog(`脚本 Agent：${rs.degraded ? "降级示例" : "AI"} 生成 ${rs.data.sections.length} 段脚本`);
      mark("script", rs.degraded ? "degraded" : "done");

      // 核查 / 分镜 / 口播 / 文案：都依赖脚本
      const downstream: { id: NodeId; api: string; key: keyof Artifacts; label: string }[] = [
        { id: "verify", api: "/api/verify", key: "factCheck", label: "核查" },
        { id: "shot", api: "/api/shotlist", key: "shotList", label: "分镜" },
        { id: "spoken", api: "/api/spoken", key: "spoken", label: "口播" },
        { id: "copy", api: "/api/publish", key: "publishKit", label: "文案" },
      ];
      for (const d of downstream) {
        mark(d.id, "running");
        const r = await post<unknown>(d.api, { script: local.script });
        (local as Record<string, unknown>)[d.key] = r.data;
        setArtifacts({ ...local });
        update({ [d.key]: r.data });
        addLog(`${d.label} Agent：${r.degraded ? "降级示例" : "AI"} 完成`);
        mark(d.id, r.degraded ? "degraded" : "done");
      }
      addLog("产线跑通，全部产物已就绪。");
    } catch {
      addLog("某节点请求失败，已停在当前步（演示不崩）。");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">工作流编排中心</h1>
        <p className="mt-1 text-sm text-slate-400">
          把编辑日常的「找选题 → 查资料 → 写脚本 → 配后期」拆成一串可编排的 Agent。一键跑通整条产线。
        </p>
      </header>

      <div className="mb-5">
        <SeedInput
          onSeed={(t) => { setSeedText(t); runAll(t); }}
          loading={running}
        />
      </div>

      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => { setSeedText(null); runAll(); }}
          disabled={running}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent/90 disabled:opacity-40"
        >
          {running ? "产线运行中…" : "▶ 一键跑全程"}
        </button>
        {seedText && (
          <span className="text-xs text-slate-500">当前种子：{seedText.slice(0, 24)}…</span>
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
              <p className="text-slate-600">点「一键跑全程」或灌入你的输入，看数据在 Agent 间流动。</p>
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
