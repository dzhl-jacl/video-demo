import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildVerifyPrompt } from "@/lib/prompts";
import { FALLBACK_FACTCHECK } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { VideoScript, FactCheck } from "@/lib/types";

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
      data: FALLBACK_FACTCHECK,
      degraded: true,
      message: hasApiKey() ? "无脚本输入，已使用示例核查" : "未配置 API Key，已使用示例核查",
    });
  }

  try {
    const { system, user } = buildVerifyPrompt(script);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const result = extractJson<FactCheck>(content);
    if (!result || !result.items) throw new Error("解析核查 JSON 失败");
    return NextResponse.json({ data: result, degraded: false, message: `由 ${providerUsed} 核查` });
  } catch (e) {
    console.error("[api/verify] 降级到静态核查:", (e as Error).message);
    return NextResponse.json({
      data: { ...FALLBACK_FACTCHECK, topicTitle: script.topicTitle },
      degraded: true,
      message: "AI 暂不可用，已使用示例核查",
    });
  }
}
