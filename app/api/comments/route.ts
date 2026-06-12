import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildCommentPrompt } from "@/lib/prompts";
import { FALLBACK_COMMENT_SELF, FALLBACK_COMMENT_COMPETITOR } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import { fetchUpComments, type RawComment } from "@/lib/bili/client";
import { SELF_COMMENT_SNAPSHOT, COMPETITOR_COMMENT_SNAPSHOT } from "@/data/comment-snapshot";
import { COMPETITORS } from "@/data/competitors";
import type { CommentInsight, CommentScope } from "@/lib/types";

export const dynamic = "force-dynamic";

const SELF_MID = 12300996; // 胜利文绉绉

export async function POST(req: Request) {
  let scope: CommentScope = "self";
  try {
    const body = await req.json();
    if (body?.scope === "competitor") scope = "competitor";
  } catch {
    scope = "self";
  }

  const fallback = scope === "self" ? FALLBACK_COMMENT_SELF : FALLBACK_COMMENT_COMPETITOR;

  // 1) hybrid 抓取：优先抓真实评论，失败回落快照样本
  let videoTitle: string;
  let comments: RawComment[];
  let upName: string;
  let live = false;
  try {
    const mid = scope === "self" ? SELF_MID : COMPETITORS[1].mid; // 对标取极客湾
    upName = scope === "self" ? "胜利文绉绉" : COMPETITORS[1].name;
    const r = await fetchUpComments(mid);
    videoTitle = r.videoTitle;
    comments = r.comments;
    live = true;
  } catch {
    const snap = scope === "self" ? SELF_COMMENT_SNAPSHOT : COMPETITOR_COMMENT_SNAPSHOT;
    videoTitle = snap.videoTitle;
    comments = snap.comments;
    upName = fallback.upName;
  }

  // 2) 没 key 直接返回静态洞察
  if (!hasApiKey()) {
    return NextResponse.json({
      data: { ...fallback, videoTitle, upName },
      degraded: true,
      message: "未配置 API Key，已使用示例洞察",
    });
  }

  // 3) AI 分类，失败回落静态洞察
  try {
    const { system, user } = buildCommentPrompt(scope, videoTitle, comments);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const parsed = extractJson<Omit<CommentInsight, "scope" | "videoTitle" | "upName">>(content);
    if (!parsed || !parsed.items) throw new Error("解析评论洞察 JSON 失败");
    const data: CommentInsight = { scope, videoTitle, upName, ...parsed };
    return NextResponse.json({
      data,
      degraded: false,
      message: `${live ? "实时评论" : "快照样本"} · 由 ${providerUsed} 分析`,
    });
  } catch (e) {
    console.error("[api/comments] 降级到静态洞察:", (e as Error).message);
    return NextResponse.json({
      data: { ...fallback, videoTitle, upName },
      degraded: true,
      message: "AI 暂不可用，已使用示例洞察",
    });
  }
}
