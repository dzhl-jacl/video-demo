import { relativeTime } from "@/lib/time";
import type { NewsItem } from "@/lib/types";

export function NewsCard({ item, onRemove }: { item: NewsItem; onRemove?: () => void }) {
  return (
    <div className="group relative">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl border border-white/5 bg-panel/60 p-4 transition hover:border-accent/40 hover:bg-panel"
      >
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="rounded bg-accent/10 px-2 py-0.5 text-accent">{item.source}</span>
          {item.category && <span>{item.category}</span>}
          <span className="ml-auto text-slate-500">{relativeTime(item.publishedAt)}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-medium text-slate-100">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">{item.summary}</p>
      </a>
      {onRemove && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
          aria-label="移除"
          className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md bg-bg/80 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 group-hover:flex"
        >
          ✕
        </button>
      )}
    </div>
  );
}
