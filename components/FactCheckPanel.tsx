import type { FactCheck, ClaimVerdict } from "@/lib/types";

const VERDICT_STYLE: Record<ClaimVerdict, string> = {
  可信: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  待核实: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  存疑: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

function searchUrl(q: string) {
  return `https://www.bing.com/search?q=${encodeURIComponent(q)}`;
}

export function FactCheckPanel({ data }: { data: FactCheck }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/5 bg-panel/60 p-3 text-xs text-slate-300">
        {data.summary}
      </div>
      {data.items.map((it, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-panel/60 p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-relaxed text-slate-100">{it.claim}</p>
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 text-[11px] ${VERDICT_STYLE[it.verdict]}`}
            >
              {it.verdict}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{it.reason}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {it.searchQueries.map((q, j) => (
              <a
                key={j}
                href={searchUrl(q)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] text-accent hover:bg-accent/20"
              >
                🔍 {q}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
