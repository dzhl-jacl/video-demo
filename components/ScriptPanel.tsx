import type { VideoScript } from "@/lib/types";

export function ScriptPanel({ script }: { script: VideoScript }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <span className="text-xs text-accent">开场钩子</span>
        <p className="mt-1 text-sm leading-relaxed text-slate-100">{script.hook}</p>
      </div>

      {script.sections.map((sec, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-panel/60 p-4">
          <h4 className="text-sm font-semibold text-accent2">{sec.heading}</h4>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-200">{sec.content}</p>
          {sec.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {sec.sources.map((s, j) => (
                <a
                  key={j}
                  href={s}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-slate-500 underline decoration-dotted hover:text-accent"
                >
                  信源 {j + 1}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="rounded-xl border border-white/5 bg-panel/60 p-4">
        <span className="text-xs text-slate-400">结尾互动</span>
        <p className="mt-1 text-sm leading-relaxed text-slate-100">{script.outro}</p>
      </div>
    </div>
  );
}
