import type { PipelineStage } from "@/lib/types";

const STEPS: { key: PipelineStage; label: string }[] = [
  { key: "news", label: "1 资讯采集" },
  { key: "topics", label: "2 AI 选题" },
  { key: "script", label: "3 脚本初稿" },
];

const ORDER: Record<PipelineStage, number> = { news: 0, topics: 1, script: 2 };

export function StageBar({ stage }: { stage: PipelineStage }) {
  const current = ORDER[stage];
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs transition ${
              i <= current ? "bg-accent/15 text-accent" : "bg-white/5 text-slate-500"
            }`}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-slate-600">→</span>}
        </div>
      ))}
    </div>
  );
}
