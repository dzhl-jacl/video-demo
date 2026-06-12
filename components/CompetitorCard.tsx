import { formatCount, relativeTime } from "@/lib/time";
import { TrendLine } from "@/components/dashboard/TrendLine";
import type { CompetitorStat } from "@/lib/types";

export function CompetitorCard({ stat }: { stat: CompetitorStat }) {
  return (
    <div className="rounded-xl border border-white/5 bg-panel/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{stat.name}</h3>
        <span className="text-xs text-slate-400">{formatCount(stat.follower)} 粉丝</span>
      </div>

      <div className="mt-3">
        <TrendLine points={stat.followerHistory} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-white/5 py-2">
          <div className="text-sm font-semibold text-slate-100">{stat.videoCount}</div>
          <div className="text-[10px] text-slate-500">近期投稿</div>
        </div>
        <div className="rounded-lg bg-white/5 py-2">
          <div className="text-sm font-semibold text-accent">{formatCount(stat.avgPlay)}</div>
          <div className="text-[10px] text-slate-500">平均播放</div>
        </div>
        <div className="rounded-lg bg-white/5 py-2">
          <div className="text-sm font-semibold text-accent2">{formatCount(stat.maxPlay)}</div>
          <div className="text-[10px] text-slate-500">最高播放</div>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="text-[11px] text-slate-500">爆款视频</div>
        {stat.topVideos.map((v) => (
          <div key={v.bvid} className="flex items-center justify-between gap-2 text-xs">
            <span className="line-clamp-1 text-slate-300">{v.title}</span>
            <span className="shrink-0 text-slate-500">
              {formatCount(v.play)}·{relativeTime(new Date(v.created * 1000).toISOString())}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
