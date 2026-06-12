"use client";

import { useState } from "react";

interface SeedInputProps {
  onSeed: (text: string) => void;
  loading?: boolean;
}

// 「任意输入」入口（杀招）：粘贴产品名/通稿/选题想法，直接灌进产线当场试。
export function SeedInput({ onSeed, loading }: SeedInputProps) {
  const [text, setText] = useState("");
  const examples = ["小米 15 Ultra 影像实测", "新款 AI 眼镜值不值得买", "国补后这台游戏本是真香还是智商税"];

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-100">把你手头的料丢进来</span>
        <span className="text-[11px] text-slate-500">产品名 / 厂商通稿 / 一个选题想法都行</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="例如：粘贴一段新品发布通稿，或直接写「华为新折叠屏值不值得买」…"
        className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-bg/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-accent/40 focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => setText(ex)}
            className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400 hover:bg-white/10"
          >
            {ex}
          </button>
        ))}
        <button
          onClick={() => text.trim() && onSeed(text.trim())}
          disabled={!text.trim() || loading}
          className="ml-auto rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-bg hover:bg-accent/90 disabled:opacity-40"
        >
          {loading ? "处理中…" : "灌进产线 →"}
        </button>
      </div>
    </div>
  );
}
