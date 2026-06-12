"use client";

import { useState } from "react";
import { CopyBar } from "@/components/CopyBar";
import { compareToMarkdown } from "@/lib/exporter";
import type { CompareTable, ApiResult } from "@/lib/types";

export default function ComparePage() {
  const [raw, setRaw] = useState("");
  const [data, setData] = useState<CompareTable | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const examples = ["小米15 Ultra / vivo X200 Pro / OPPO Find X8 Pro", "ROG幻16 / 联想Y9000P / 华硕天选5"];

  async function generate() {
    const products = raw.split(/[\/,，、\n]+/).map((s) => s.trim()).filter(Boolean);
    if (products.length < 2) {
      setNotice("至少输入 2 款产品（用 / 或换行分隔）");
      return;
    }
    setLoading(true);
    setNotice(null);
    setData(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const json: ApiResult<CompareTable> = await res.json();
      setData(json.data);
      if (json.degraded) setNotice(json.message ?? "已使用示例对比表");
    } catch {
      setNotice("生成失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">横评数据表生成器</h1>
        <p className="mt-1 text-sm text-slate-400">
          输入几款产品，一键生成结构化横评对比表骨架，标好哪些维度需要实测核实，直接拿去填数据。
        </p>
      </header>

      <div className="mb-5 rounded-xl border border-accent/20 bg-accent/5 p-4">
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={2}
          placeholder="输入要横评的产品，用 / 或换行分隔，如：小米15 Ultra / vivo X200 Pro / OPPO Find X8 Pro"
          className="w-full resize-none rounded-lg border border-white/10 bg-bg/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-accent/40 focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setRaw(ex)}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400 hover:bg-white/10"
            >
              {ex}
            </button>
          ))}
          <button
            onClick={generate}
            disabled={loading}
            className="ml-auto rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-bg hover:bg-accent/90 disabled:opacity-40"
          >
            {loading ? "生成中…" : "生成对比表 →"}
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {notice}
        </div>
      )}

      {data && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <CopyBar getMarkdown={() => compareToMarkdown(data)} filename="横评对比表.md" />
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/5 bg-panel/50">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="p-3 font-medium">维度</th>
                  {data.products.map((p, i) => (
                    <th key={i} className="p-3 font-medium text-slate-200">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r, i) => (
                  <tr key={i} className="border-b border-white/5 align-top">
                    <td className="p-3 font-medium text-accent2">{r.dimension}</td>
                    {r.values.map((v, j) => (
                      <td key={j} className="p-3 text-slate-200">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.rows.some((r) => r.verifyNote) && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
              <div className="text-xs font-semibold text-rose-300">需实测核实</div>
              <ul className="mt-2 space-y-1">
                {data.rows
                  .filter((r) => r.verifyNote)
                  .map((r, i) => (
                    <li key={i} className="text-xs text-slate-300">
                      <span className="text-slate-500">{r.dimension}：</span>
                      {r.verifyNote}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <div className="rounded-xl border border-white/5 bg-panel/50 p-4">
            <div className="text-xs text-accent">横评结论</div>
            <p className="mt-1 text-sm leading-relaxed text-slate-100">{data.verdict}</p>
          </div>
        </div>
      )}
    </div>
  );
}
