import { NextResponse } from "next/server";
import { COMPETITORS } from "@/data/competitors";
import { fetchCompetitor } from "@/lib/bili/client";
import { getBiliSnapshot } from "@/data/bili-snapshot";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildHotspotPrompt } from "@/lib/prompts";
import { FALLBACK_HOTSPOT } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { CompetitorStat, HotspotAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

// 聚合对标 UP 的高播放视频作为爆款样本池
async function gatherTopVideos(): Promise<{ title: string; play: number; duration: string; category?: string; up: string }[]> {
  const results = await Promise.allSettled(COMPETITORS.map((c) => fetchCompetitor(c)));
  let stats: CompetitorStat[] = results
    .filter((r): r is PromiseFulfilledResult<CompetitorStat> => r.status === "fulfilled" && r.value.videoCount > 0)
    .map((r) => r.value);

  if (stats.length === 0) stats = getBiliSnapshot();

  return stats.flatMap((s) =>
    s.topVideos.map((v) => ({
      title: v.title,
      play: v.play,
      duration: v.duration,
      category: v.category,
      up: s.name,
    }))
  );
}

export async function POST() {
  const samples = await gatherTopVideos();

  if (!hasApiKey() || samples.length === 0) {
    return NextResponse.json({
      data: FALLBACK_HOTSPOT,
      degraded: true,
      message: hasApiKey() ? "无样本数据，已使用示例分析" : "未配置 API Key，已使用示例分析",
    });
  }

  try {
    const top = samples.sort((a, b) => b.play - a.play).slice(0, 12);
    const { system, user } = buildHotspotPrompt(top);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const analysis = extractJson<HotspotAnalysis>(content);
    if (!analysis || !analysis.differentiation) throw new Error("解析爆款分析 JSON 失败");
    return NextResponse.json({ data: analysis, degraded: false, message: `由 ${providerUsed} 生成` });
  } catch (e) {
    console.error("[api/bili/hotspot] 降级到静态分析:", (e as Error).message);
    return NextResponse.json({
      data: FALLBACK_HOTSPOT,
      degraded: true,
      message: "AI 暂不可用，已使用示例分析",
    });
  }
}
