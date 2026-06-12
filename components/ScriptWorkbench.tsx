"use client";

import { useState } from "react";
import { ScriptPanel } from "@/components/ScriptPanel";
import { FactCheckPanel } from "@/components/FactCheckPanel";
import { ShotListPanel } from "@/components/ShotListPanel";
import { SpokenPanel } from "@/components/SpokenPanel";
import { PublishPanel } from "@/components/PublishPanel";
import { CopyBar } from "@/components/CopyBar";
import {
  scriptToMarkdown,
  factCheckToMarkdown,
  shotListToMarkdown,
  spokenToMarkdown,
  publishToMarkdown,
} from "@/lib/exporter";
import type {
  VideoScript,
  FactCheck,
  ShotList,
  SpokenScript,
  PublishKit,
  ApiResult,
} from "@/lib/types";

type TabId = "script" | "verify" | "shot" | "spoken" | "copy";

interface WorkbenchProps {
  script: VideoScript;
  factCheck: FactCheck | null;
  shotList: ShotList | null;
  spoken: SpokenScript | null;
  publishKit: PublishKit | null;
  onResult: (patch: {
    factCheck?: FactCheck;
    shotList?: ShotList;
    spoken?: SpokenScript;
    publishKit?: PublishKit;
  }) => void;
  onSaveToLibrary?: () => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "script", label: "脚本初稿" },
  { id: "verify", label: "核查" },
  { id: "shot", label: "分镜" },
  { id: "spoken", label: "口播" },
  { id: "copy", label: "文案" },
];

export function ScriptWorkbench(props: WorkbenchProps) {
  const { script, factCheck, shotList, spoken, publishKit, onResult, onSaveToLibrary } = props;
  const [tab, setTab] = useState<TabId>("script");
  const [loading, setLoading] = useState<TabId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function runAgent(
    id: Exclude<TabId, "script">,
    api: string,
    apply: (data: unknown) => void
  ) {
    setLoading(id);
    setNotice(null);
    try {
      const res = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const json: ApiResult<unknown> = await res.json();
      apply(json.data);
      if (json.degraded) setNotice(json.message ?? "已使用示例数据");
    } catch {
      setNotice("生成失败，请重试");
    } finally {
      setLoading(null);
    }
  }

  function ensure(id: Exclude<TabId, "script">) {
    if (id === "verify" && !factCheck)
      runAgent(id, "/api/verify", (d) => onResult({ factCheck: d as FactCheck }));
    if (id === "shot" && !shotList)
      runAgent(id, "/api/shotlist", (d) => onResult({ shotList: d as ShotList }));
    if (id === "spoken" && !spoken)
      runAgent(id, "/api/spoken", (d) => onResult({ spoken: d as SpokenScript }));
    if (id === "copy" && !publishKit)
      runAgent(id, "/api/publish", (d) => onResult({ publishKit: d as PublishKit }));
  }

  function selectTab(id: TabId) {
    setTab(id);
    setNotice(null);
    if (id !== "script") ensure(id);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => selectTab(t.id)}
            className={`rounded-lg px-2.5 py-1 text-xs transition ${
              tab === t.id
                ? "bg-accent/15 text-accent"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {t.label}
            {loading === t.id && " …"}
          </button>
        ))}
      </div>

      {notice && (
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {notice}
        </div>
      )}

      <div className="mb-3 flex items-center justify-end gap-2">
        {tab === "script" && onSaveToLibrary && (
          <button
            onClick={() => { onSaveToLibrary(); setSaved(true); setTimeout(() => setSaved(false), 1500); }}
            className="rounded-md bg-accent2/15 px-2.5 py-1 text-[11px] text-accent2 hover:bg-accent2/25"
          >
            {saved ? "已存入" : "存入脚本库"}
          </button>
        )}
        {renderCopyBar()}
      </div>

      {renderBody()}
    </div>
  );

  function renderCopyBar() {
    if (tab === "script")
      return <CopyBar getMarkdown={() => scriptToMarkdown(script)} filename="脚本初稿.md" />;
    if (tab === "verify" && factCheck)
      return <CopyBar getMarkdown={() => factCheckToMarkdown(factCheck)} filename="事实核查.md" />;
    if (tab === "shot" && shotList)
      return <CopyBar getMarkdown={() => shotListToMarkdown(shotList)} filename="分镜表.md" />;
    if (tab === "spoken" && spoken)
      return <CopyBar getMarkdown={() => spokenToMarkdown(spoken)} filename="口播稿.md" />;
    if (tab === "copy" && publishKit)
      return <CopyBar getMarkdown={() => publishToMarkdown(publishKit)} filename="发布文案.md" />;
    return null;
  }

  function renderBody() {
    if (tab === "script") return <ScriptPanel script={script} />;
    if (loading === tab)
      return <p className="py-8 text-center text-xs text-slate-500">AI 生成中…</p>;
    if (tab === "verify")
      return factCheck ? <FactCheckPanel data={factCheck} /> : empty();
    if (tab === "shot") return shotList ? <ShotListPanel data={shotList} /> : empty();
    if (tab === "spoken") return spoken ? <SpokenPanel data={spoken} /> : empty();
    if (tab === "copy") return publishKit ? <PublishPanel data={publishKit} /> : empty();
    return null;
  }

  function empty() {
    return <p className="py-8 text-center text-xs text-slate-500">点击该标签即可让对应 Agent 生成</p>;
  }
}
