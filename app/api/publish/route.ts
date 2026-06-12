import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildPublishPrompt } from "@/lib/prompts";
import { FALLBACK_PUBLISH } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { VideoScript, PublishKit } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let script: VideoScript | null = null;
  try {
    const body = await req.json();
    script = body?.script ?? null;
  } catch {
    script = null;
  }

  if (!hasApiKey() || !script || !script.sections) {
    return NextResponse.json({
      data: FALLBACK_PUBLISH,
      degraded: true,
      message: hasApiKey() ? "无脚本输入，已使用示例文案" : "未配置 API Key，已使用示例文案",
    });
  }

  try {
    const { system, user } = buildPublishPrompt(script);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const result = extractJson<PublishKit>(content);
    if (!result || !result.titles) throw new Error("解析文案 JSON 失败");
    return NextResponse.json({ data: result, degraded: false, message: `由 ${providerUsed} 生成` });
  } catch (e) {
    console.error("[api/publish] 降级到静态文案:", (e as Error).message);
    return NextResponse.json({
      data: FALLBACK_PUBLISH,
      degraded: true,
      message: "AI 暂不可用，已使用示例文案",
    });
  }
}
