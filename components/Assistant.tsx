"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const PAGE_CONTEXT: Record<string, string> = {
  "/": "竞品看板：同类 UP 数据与爆款拆解",
  "/workflow": "工作流编排中心：一条龙 Agent 产线",
  "/radar": "资讯雷达：刷一手数码资讯找选题",
  "/comments": "评论区反哺：从评论挖选题与纠错",
  "/compare": "横评表生成：多款产品对比",
  "/studio": "选题生产：资讯到脚本一条龙",
  "/library": "脚本库：归档与对比",
  "/report": "选题日报/周报：产出汇总",
  "/agents": "Agent 库",
  "/playbook": "工作流手册",
  "/about": "关于作者",
};

const QUICK = ["这个选题怎么切入更硬核？", "帮我想 3 个视频标题", "这段话怎么改更有活人感？"];

export function Assistant() {
  return <FloatingAssistant />;
}

function FloatingAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 会话持久化：切页面、刷新都不丢历史
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("assistant-msgs");
      if (raw) setMsgs(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("assistant-msgs", JSON.stringify(msgs));
    } catch {
      // ignore
    }
  }, [msgs]);

  function clearChat() {
    setMsgs([]);
    try {
      sessionStorage.removeItem("assistant-msgs");
    } catch {
      // ignore
    }
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, pageContext: PAGE_CONTEXT[pathname] ?? "" }),
      });
      const json = await res.json();
      setMsgs([...next, { role: "assistant", content: json.data }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "网络出错了，稍后再试。" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-bg shadow-lg shadow-accent/20 transition hover:scale-105"
          aria-label="打开 AI 助手"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col rounded-2xl border border-white/10 bg-panel shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-slate-100">AI 助手</div>
              <div className="text-[10px] text-slate-500">{PAGE_CONTEXT[pathname] ?? "内容生产助手"}</div>
            </div>
            <div className="flex items-center gap-3">
              {msgs.length > 0 && (
                <button onClick={clearChat} className="text-[11px] text-slate-500 hover:text-slate-300">清空</button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">✕</button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">问我任何关于选题、脚本、纠错的问题。试试：</p>
                {QUICK.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="block w-full rounded-lg border border-white/5 bg-bg/40 px-3 py-2 text-left text-xs text-slate-300 hover:border-accent/30"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user" ? "bg-accent/15 text-accent" : "bg-white/5 text-slate-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-500">思考中…</div>}
          </div>

          <div className="border-t border-white/5 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(input)}
                placeholder="输入问题，回车发送"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-bg/60 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-accent/40 focus:outline-none"
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-bg hover:bg-accent/90 disabled:opacity-40"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
