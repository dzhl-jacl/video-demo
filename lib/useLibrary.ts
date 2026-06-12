"use client";

import { useCallback, useEffect, useState } from "react";
import type { VideoScript } from "@/lib/types";

const LIB_KEY = "script-library-v1";

export interface ScriptEntry {
  id: string;
  savedAt: number;
  topicTitle: string;
  category?: string;
  script: VideoScript;
}

// 脚本库：把生成的脚本归档到 localStorage，可回看、可对比迭代。
export function useLibrary() {
  const [entries, setEntries] = useState<ScriptEntry[]>([]);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIB_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // ignore
    }
    setRestored(true);
  }, []);

  const persist = useCallback((next: ScriptEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(LIB_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback(
    (script: VideoScript, category?: string) => {
      const entry: ScriptEntry = {
        id: `lib-${Date.now()}`,
        savedAt: Date.now(),
        topicTitle: script.topicTitle,
        category,
        script,
      };
      setEntries((prev) => {
        const next = [entry, ...prev].slice(0, 50);
        try {
          localStorage.setItem(LIB_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
      return entry.id;
    },
    []
  );

  const remove = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const next = prev.filter((e) => e.id !== id);
        try {
          localStorage.setItem(LIB_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  return { entries, restored, save, remove, persist };
}
