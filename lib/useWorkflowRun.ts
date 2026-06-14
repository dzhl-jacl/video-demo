"use client";

import { useEffect, useRef, useState } from "react";
import type {
  NewsItem,
  Topic,
  VideoScript,
  FactCheck,
  ShotList,
  SpokenScript,
  PublishKit,
} from "@/lib/types";

export type NodeId = "collect" | "topic" | "script" | "verify" | "shot" | "spoken" | "copy";
export type NodeStatus = "idle" | "running" | "done" | "degraded";

export interface WorkflowArtifacts {
  news?: NewsItem[];
  topic?: Topic;
  script?: VideoScript;
  factCheck?: FactCheck;
  shotList?: ShotList;
  spoken?: SpokenScript;
  publishKit?: PublishKit;
}

export interface WorkflowRunState {
  status: Record<NodeId, NodeStatus>;
  log: string[];
  artifacts: WorkflowArtifacts;
  seedText: string | null;
}

const RUN_KEY = "workflow-run-v1";

export const IDLE_STATUS: Record<NodeId, NodeStatus> = {
  collect: "idle",
  topic: "idle",
  script: "idle",
  verify: "idle",
  shot: "idle",
  spoken: "idle",
  copy: "idle",
};

const EMPTY_RUN: WorkflowRunState = {
  status: IDLE_STATUS,
  log: [],
  artifacts: {},
  seedText: null,
};

// workflow 运行态持久化：把节点状态/日志/产物/种子存 sessionStorage，
// 切到别的页面再回来、刷新页面都不丢，运行体验连续（容错铁律：读写均 try/catch）。
export function useWorkflowRun() {
  const [run, setRun] = useState<WorkflowRunState>(EMPTY_RUN);
  const [restored, setRestored] = useState(false);
  const runRef = useRef<WorkflowRunState>(EMPTY_RUN);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RUN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WorkflowRunState;
        setRun(parsed);
        runRef.current = parsed;
      }
    } catch {
      // ignore
    }
    setRestored(true);
  }, []);

  function persist(next: WorkflowRunState) {
    runRef.current = next;
    setRun(next);
    try {
      sessionStorage.setItem(RUN_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  function markNode(id: NodeId, s: NodeStatus) {
    persist({ ...runRef.current, status: { ...runRef.current.status, [id]: s } });
  }

  function addLog(line: string) {
    persist({ ...runRef.current, log: [...runRef.current.log, line] });
  }

  function setArtifacts(artifacts: WorkflowArtifacts) {
    persist({ ...runRef.current, artifacts });
  }

  function setSeedText(seedText: string | null) {
    persist({ ...runRef.current, seedText });
  }

  function resetRun(seedText: string | null) {
    persist({ status: IDLE_STATUS, log: [], artifacts: {}, seedText });
  }

  function clearRun() {
    runRef.current = EMPTY_RUN;
    setRun(EMPTY_RUN);
    try {
      sessionStorage.removeItem(RUN_KEY);
    } catch {
      // ignore
    }
  }

  return { run, restored, markNode, addLog, setArtifacts, setSeedText, resetRun, clearRun };
}
