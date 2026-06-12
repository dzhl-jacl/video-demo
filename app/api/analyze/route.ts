import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildNewsAnalysisPrompt } from "@/lib/prompts";
import { FALLBACK_NEWS_ANALYSIS } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { NewsAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let title = "";
  let summary = "";
  let source = "";
  try {
    const body = await req.json();
    title = String(body?.title ?? "");
    summary = String(body?.summary ?? "");
    source = String(body?.source ?? "");
  } catch {
    // ignore
  }

  if (!hasApiKey() || !title) {
    return NextResponse.json({
      data: FALLBACK_NEWS_ANALYSIS,
      degraded: true,
      message: hasApiKey() ? "无资讯输入，已使用示例分析" : "未配置 API Key，已使用示例分析",
    });
  }

  try {
    const { system, user } = buildNewsAnalysisPrompt(title, summary, source);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const analysis = extractJson<NewsAnalysis>(content);
    if (!analysis || !analysis.angles) throw new Error("解析资讯分析 JSON 失败");
    return NextResponse.json({ data: analysis, degraded: false, message: `由 ${providerUsed} 生成` });
  } catch (e) {
    console.error("[api/analyze] 降级到静态分析:", (e as Error).message);
    return NextResponse.json({
      data: FALLBACK_NEWS_ANALYSIS,
      degraded: true,
      message: "AI 暂不可用，已使用示例分析",
    });
  }
}
