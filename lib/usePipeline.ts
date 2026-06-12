"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  NewsItem,
  Topic,
  VideoScript,
  PipelineStage,
  FactCheck,
  ShotList,
  SpokenScript,
  PublishKit,
} from "@/lib/types";

const STORAGE_KEY = "tech-topic-pipeline-v3";
const LEGACY_KEYS = ["tech-topic-pipeline-v1", "tech-topic-pipeline-v2"];

interface PipelineState {
  stage: PipelineStage;
  news: NewsItem[];
  topics: Topic[];
  selectedTopic: Topic | null;
  script: VideoScript | null;
  factCheck: FactCheck | null;
  shotList: ShotList | null;
  spoken: SpokenScript | null;
  publishKit: PublishKit | null;
}

const EMPTY: PipelineState = {
  stage: "news",
  news: [],
  topics: [],
  selectedTopic: null,
  script: null,
  factCheck: null,
  shotList: null,
  spoken: null,
  publishKit: null,
};

// 阶段状态机 + 断点恢复：把采集/选题/脚本三个阶段结果持久化到 localStorage，
// 刷新、切走再回来、或某步中断都能从上一步恢复，无需从头重跑。
export function usePipeline() {
  const [state, setState] = useState<PipelineState>(EMPTY);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      // 清理跨版本旧缓存，避免旧版选题/脚本残留
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // 忽略损坏的缓存
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 忽略写入失败
    }
  }, [state, restored]);

  const update = useCallback((patch: Partial<PipelineState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState(EMPTY);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { state, update, reset, restored };
}
