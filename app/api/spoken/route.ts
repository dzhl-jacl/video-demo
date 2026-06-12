import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildSpokenPrompt } from "@/lib/prompts";
import { FALLBACK_SPOKEN } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { VideoScript, SpokenScript } from "@/lib/types";

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
      data: FALLBACK_SPOKEN,
      degraded: true,
      message: hasApiKey() ? "无脚本输入，已使用示例口播稿" : "未配置 API Key，已使用示例口播稿",
    });
  }

  try {
    const { system, user } = buildSpokenPrompt(script);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const result = extractJson<SpokenScript>(content);
    if (!result || !result.content) throw new Error("解析口播 JSON 失败");
    return NextResponse.json({ data: result, degraded: false, message: `由 ${providerUsed} 生成` });
  } catch (e) {
    console.error("[api/spoken] 降级到静态口播:", (e as Error).message);
    return NextResponse.json({
      data: { ...FALLBACK_SPOKEN, topicTitle: script.topicTitle },
      degraded: true,
      message: "AI 暂不可用，已使用示例口播稿",
    });
  }
}
