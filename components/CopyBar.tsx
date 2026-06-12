"use client";

import { useState } from "react";

interface CopyBarProps {
  getMarkdown: () => string;
  filename: string;
}

// 一键复制 Markdown + 导出 .md 文件：让每个产物都能直接拿走用。
export function CopyBar({ getMarkdown, filename }: CopyBarProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(getMarkdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const blob = new Blob([getMarkdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={copy}
        className="rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10"
      >
        {copied ? "已复制" : "复制 Markdown"}
      </button>
      <button
        onClick={download}
        className="rounded-md bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-white/10"
      >
        导出 .md
      </button>
    </div>
  );
}
