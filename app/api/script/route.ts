import { NextResponse } from "next/server";
import { chatWithFallback, extractJson } from "@/lib/deepseek";
import { buildScriptPrompt } from "@/lib/prompts";
import { FALLBACK_SCRIPT } from "@/lib/fallback";
import { hasApiKey } from "@/lib/providers";
import type { Topic, VideoScript } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let topic: Topic | null = null;
  try {
    const body = await req.json();
    topic = body?.topic ?? null;
  } catch {
    topic = null;
  }

  if (!hasApiKey() || !topic) {
    return NextResponse.json({
      data: FALLBACK_SCRIPT,
      degraded: true,
      message: hasApiKey() ? "无选题输入，已使用示例脚本" : "未配置 API Key，已使用示例脚本",
    });
  }

  try {
    const { system, user } = buildScriptPrompt(topic);
    const { content, providerUsed } = await chatWithFallback([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
    const script = extractJson<VideoScript>(content);
    if (!script || !script.sections) throw new Error("解析脚本 JSON 失败");
    return NextResponse.json({ data: script, degraded: false, message: `由 ${providerUsed} 生成` });
  } catch (e) {
    console.error("[api/script] 降级到静态脚本:", (e as Error).message);
    return NextResponse.json({
      data: { ...FALLBACK_SCRIPT, topicTitle: topic.title },
      degraded: true,
      message: "AI 暂不可用，已使用示例脚本",
    });
  }
}
