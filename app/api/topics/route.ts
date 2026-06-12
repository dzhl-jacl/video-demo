import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildTopicPrompt } from "@/lib/prompts";
import { FALLBACK_TOPICS } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { NewsItem, Topic } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let news: NewsItem[] = [];
  let preferredCategory: string | undefined;
  try {
    const body = await req.json();
    news = Array.isArray(body?.news) ? body.news : [];
    preferredCategory = typeof body?.preferredCategory === "string" ? body.preferredCategory : undefined;
  } catch {
    news = [];
  }

  if (!hasApiKey() || news.length === 0) {
    return NextResponse.json({
      data: FALLBACK_TOPICS,
      degraded: true,
      message: hasApiKey() ? "无资讯输入，已使用示例选题" : "未配置 API Key，已使用示例选题",
    });
  }

  try {
    const { system, user } = buildTopicPrompt(news, preferredCategory);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const topics = extractJson<Topic[]>(content);
    if (!topics || topics.length === 0) throw new Error("解析选题 JSON 失败");
    return NextResponse.json({ data: topics, degraded: false, message: `由 ${providerUsed} 生成` });
  } catch (e) {
    console.error("[api/topics] 降级到静态选题:", (e as Error).message);
    return NextResponse.json({
      data: FALLBACK_TOPICS,
      degraded: true,
      message: "AI 暂不可用，已使用示例选题",
    });
  }
}
