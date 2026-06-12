import type { SpokenScript } from "@/lib/types";

export function SpokenPanel({ data }: { data: SpokenScript }) {
  return (
    <div className="rounded-xl border border-white/5 bg-panel/60 p-4">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
        {data.content}
      </p>
    </div>
  );
}
