import { AGENTS } from "@/lib/agents";

export const metadata = { title: "Agent 库" };

export default function AgentsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-50">Agent 库</h1>
        <p className="mt-1 text-sm text-slate-400">
          产线上每个 Agent 的角色、吃什么、产出什么、用什么模型、挂了怎么降级。组件视图，对应工作流编排中心的每个节点。
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {AGENTS.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-white/5 bg-panel/50 p-5 transition hover:border-accent/30"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{a.emoji}</span>
              <h2 className="text-base font-semibold text-slate-100">{a.name}</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{a.role}</p>

            <dl className="mt-4 space-y-2 text-xs">
              <Row label="输入" value={a.input} />
              <Row label="输出" value={a.output} />
              <Row label="接口" value={a.api} mono />
              <Row label="模型" value={a.model} />
            </dl>

            <div className="mt-4 rounded-lg border border-white/5 bg-bg/40 p-3">
              <div className="text-[11px] text-accent2">Prompt 意图</div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{a.promptSummary}</p>
            </div>
            <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="text-[11px] text-amber-300">降级策略</div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{a.fallback}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="w-8 shrink-0 text-slate-500">{label}</dt>
      <dd className={`text-slate-300 ${mono ? "font-mono text-accent" : ""}`}>{value}</dd>
    </div>
  );
}
