import type { CompetitorStat } from "@/lib/types";

export interface CategoryStat {
  label: string;
  value: number;
}

export interface InsightTopic {
  title: string;
  category: string;
  reason: string;
  refPlay: number;
}

// 从竞品视频聚合品类播放占比（按播放量加权）
export function aggregateCategories(stats: CompetitorStat[]): CategoryStat[] {
  const map = new Map<string, number>();
  for (const s of stats) {
    for (const v of s.topVideos) {
      const cat = v.category ?? "其他";
      map.set(cat, (map.get(cat) ?? 0) + v.play);
    }
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

// 选题反推：从高播放视频里提炼"值得跟进的选题方向"
export function deriveInsights(stats: CompetitorStat[]): InsightTopic[] {
  const all = stats.flatMap((s) =>
    s.topVideos.map((v) => ({ ...v, up: s.name }))
  );
  const sorted = all.sort((a, b) => b.play - a.play).slice(0, 5);
  return sorted.map((v) => ({
    title: `跟进选题：${v.category ?? "数码"}方向「${v.title}」的同类深度测评`,
    category: v.category ?? "数码",
    reason: `${v.up} 的同类视频播放达 ${v.play.toLocaleString()}，该品类近期热度高，值得做差异化深度测评。`,
    refPlay: v.play,
  }));
}
